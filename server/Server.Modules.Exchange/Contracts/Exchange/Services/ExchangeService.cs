using Microsoft.EntityFrameworkCore;
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
        return currencies.Select(c => new CurrencyDto(c.Id, c.Code)).ToList();
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
