using Microsoft.EntityFrameworkCore;
using System.Linq;
using Server.Modules.Exchange.Application.Services;
using Server.Modules.Exchange.Contracts.Exchange.Dtos;
using Server.Modules.Exchange.Domain.Currencies.Repositories;
using Server.Modules.Exchange.Domain.Orders;
using Server.Modules.Exchange.Domain.Orders.Repositories;
using Server.Modules.Exchange.Domain.Rates.Repositories;

namespace Server.Modules.Exchange.Contracts.Exchange.Services;

public sealed class ExchangeService : IExchangeService
{
    private readonly DbContext _dbContext;
    private readonly ICurrencyRepository _currencyRepository;
    private readonly IExchangeRateRepository _exchangeRateRepository;
    private readonly IExchangeOrderRepository _orderRepository;

    public ExchangeService(
        DbContext dbContext,
        ICurrencyRepository currencyRepository,
        IExchangeRateRepository exchangeRateRepository,
        IExchangeOrderRepository orderRepository)
    {
        _dbContext = dbContext;
        _currencyRepository = currencyRepository;
        _exchangeRateRepository = exchangeRateRepository;
        _orderRepository = orderRepository;
    }

    public async Task<IReadOnlyCollection<CurrencyDto>> GetCurrenciesAsync(CancellationToken cancellationToken = default)
    {
        var currencies = await _currencyRepository.GetListAsync(cancellationToken);
        return currencies.Select(c => new CurrencyDto(c.Id, c.Code, c.Name)).ToList();
    }

    public async Task<IReadOnlyCollection<ExchangeRateDto>> GetLatestRatesAsync(CancellationToken cancellationToken = default)
    {
        var snapshots = await _exchangeRateRepository.GetLatestAsync(cancellationToken);
        return snapshots
            .Select(s => new ExchangeRateDto(
                s.BaseCurrency.Code,
                s.QuoteCurrency.Code,
                s.Rate,
                s.CapturedAtUtc))
            .ToList();
    }

    public async Task<IReadOnlyCollection<ExchangeRateSummaryDto>> GetRateSummariesAsync(int days, CancellationToken cancellationToken = default)
    {
        // Clamp rather than reject: the window is a display preference, and a
        // silly value should degrade to a sane chart, not a 400.
        var window = Math.Clamp(days, 1, 365);
        var fromUtc = DateTime.UtcNow.AddDays(-window);

        var snapshots = await _exchangeRateRepository.GetSinceAsync(fromUtc, cancellationToken);

        // A pair with no movement inside the window still has a current rate, so
        // start from the latest set and enrich it -- otherwise quiet pairs would
        // vanish from the screen entirely.
        var latest = await _exchangeRateRepository.GetLatestAsync(cancellationToken);

        var history = snapshots
            .GroupBy(s => (Base: s.BaseCurrency.Code, Quote: s.QuoteCurrency.Code))
            .ToDictionary(
                g => g.Key,
                g => g.OrderBy(s => s.CapturedAtUtc).ToList());

        var summaries = new List<ExchangeRateSummaryDto>(latest.Count);

        foreach (var snapshot in latest)
        {
            var key = (Base: snapshot.BaseCurrency.Code, Quote: snapshot.QuoteCurrency.Code);
            var points = history.TryGetValue(key, out var series) ? series : new List<Domain.Rates.ExchangeRateSnapshot>();

            // "Previous" is the last reading at least 24h older than the current
            // one; falling back to the prior point keeps the delta meaningful for
            // pairs that are sampled less often than daily.
            var cutoff = snapshot.CapturedAtUtc.AddHours(-24);
            var previous = points.LastOrDefault(p => p.CapturedAtUtc <= cutoff)
                ?? points.LastOrDefault(p => p.CapturedAtUtc < snapshot.CapturedAtUtc);

            decimal? changePercent = previous is { Rate: > 0 }
                ? Math.Round((snapshot.Rate - previous.Rate) / previous.Rate * 100m, 2, MidpointRounding.AwayFromZero)
                : null;

            summaries.Add(new ExchangeRateSummaryDto(
                snapshot.BaseCurrency.Code,
                snapshot.QuoteCurrency.Code,
                snapshot.Rate,
                snapshot.CapturedAtUtc,
                previous?.Rate,
                changePercent,
                points.Count > 0 ? points.Min(p => p.Rate) : null,
                points.Count > 0 ? points.Max(p => p.Rate) : null,
                points.Select(p => new ExchangeRatePointDto(p.CapturedAtUtc, p.Rate)).ToList()));
        }

        return summaries;
    }

    public async Task<CreateExchangeOrderResult> CreateOrderAsync(Guid userId, CreateExchangeOrderRequest request, CancellationToken cancellationToken = default)
    {
        if (request.BaseAmount <= 0) return new CreateExchangeOrderResult(false, null, CreateExchangeOrderError.Invalid);

        var baseCode = (request.BaseCurrencyCode ?? string.Empty).Trim().ToUpperInvariant();
        var quoteCode = (request.QuoteCurrencyCode ?? string.Empty).Trim().ToUpperInvariant();

        if (baseCode.Length != 3 || quoteCode.Length != 3) return new CreateExchangeOrderResult(false, null, CreateExchangeOrderError.Invalid);
        if (string.Equals(baseCode, quoteCode, StringComparison.OrdinalIgnoreCase)) return new CreateExchangeOrderResult(false, null, CreateExchangeOrderError.Invalid);

        var currencies = await _currencyRepository.GetByCodesAsync(new[] { baseCode, quoteCode }, cancellationToken);
        if (!currencies.TryGetValue(baseCode, out var baseCurrency) || !currencies.TryGetValue(quoteCode, out var quoteCurrency))
        {
            return new CreateExchangeOrderResult(false, null, CreateExchangeOrderError.CurrencyNotFound);
        }

        var rateSnapshot = await _exchangeRateRepository.GetLatestForPairAsync(baseCurrency.Id, quoteCurrency.Id, cancellationToken);
        if (rateSnapshot == null)
        {
            return new CreateExchangeOrderResult(false, null, CreateExchangeOrderError.RateNotFound);
        }

        var now = DateTime.UtcNow;
        var quoteAmount = Math.Round(request.BaseAmount * rateSnapshot.Rate, 2, MidpointRounding.AwayFromZero);

        await using var tx = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var order = new ExchangeOrder
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            BaseCurrencyId = baseCurrency.Id,
            QuoteCurrencyId = quoteCurrency.Id,
            BaseAmount = request.BaseAmount,
            Rate = rateSnapshot.Rate,
            QuoteAmount = quoteAmount,
            Status = ExchangeOrderStatus.Pending,
            CreatedAtUtc = now
        };

        await _orderRepository.CreateAsync(order, cancellationToken);
        await _orderRepository.SaveChangesAsync(cancellationToken);

        await tx.CommitAsync(cancellationToken);

        return new CreateExchangeOrderResult(true, order.Id, null);
    }

    public async Task<UpdateExchangeOrderStatusResult> UpdateOrderStatusAsync(Guid orderId, ExchangeOrderStatus status, CancellationToken cancellationToken = default)
    {
        if (status is not (ExchangeOrderStatus.Completed or ExchangeOrderStatus.Cancelled))
        {
            return new UpdateExchangeOrderStatusResult(false, UpdateExchangeOrderStatusError.Invalid);
        }

        var order = await _orderRepository.GetForUpdateAsync(orderId, cancellationToken);
        if (order == null) return new UpdateExchangeOrderStatusResult(false, UpdateExchangeOrderStatusError.NotFound);

        if (order.Status != ExchangeOrderStatus.Pending)
        {
            return new UpdateExchangeOrderStatusResult(false, UpdateExchangeOrderStatusError.InvalidTransition);
        }

        order.Status = status;
        order.UpdatedAtUtc = DateTime.UtcNow;

        await _orderRepository.SaveChangesAsync(cancellationToken);
        return new UpdateExchangeOrderStatusResult(true, null);
    }
}
