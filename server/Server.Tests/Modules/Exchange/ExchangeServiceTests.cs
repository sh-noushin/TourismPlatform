using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Exchange.Application.Services;
using Server.Modules.Exchange.Contracts.Exchange.Dtos;
using Server.Modules.Exchange.Contracts.Exchange.Services;
using Server.Modules.Exchange.Domain.Currencies;
using Server.Modules.Exchange.Domain.Orders;
using Server.Modules.Exchange.Domain.Rates;
using Server.Modules.Exchange.Infrastructure.Repositories;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Exchange;

public sealed class ExchangeServiceTests
{
    [Fact]
    public async Task CreateOrderAsync_CreatesPendingOrder_WithRoundedQuoteAmount()
    {
        await using var db = new TestDb();

        var usd = new Currency { Id = Guid.NewGuid(), Code = "USD" };
        var eur = new Currency { Id = Guid.NewGuid(), Code = "EUR" };
        db.Context.AddRange(usd, eur);

        var rate = new ExchangeRateSnapshot
        {
            Id = Guid.NewGuid(),
            BaseCurrencyId = usd.Id,
            QuoteCurrencyId = eur.Id,
            Rate = 0.91m,
            CapturedAtUtc = DateTime.UtcNow
        };
        db.Context.Add(rate);

        await db.Context.SaveChangesAsync();

        var currencyRepo = new CurrencyRepository(db.Context);
        var rateRepo = new ExchangeRateRepository(db.Context);
        var orderRepo = new ExchangeOrderRepository(db.Context);

        var service = new ExchangeService(db.Context, currencyRepo, rateRepo, orderRepo);

        var userId = Guid.NewGuid();
        var result = await service.CreateOrderAsync(userId, new CreateExchangeOrderRequest("USD", "EUR", 10.005m));

        Assert.True(result.IsSuccess);
        Assert.NotNull(result.OrderId);

        var order = await db.Context.Set<ExchangeOrder>().FindAsync(result.OrderId!.Value);
        Assert.NotNull(order);
        Assert.Equal(userId, order!.UserId);
        Assert.Equal(ExchangeOrderStatus.Pending, order.Status);
        Assert.Equal(10.005m, order.BaseAmount);
        Assert.Equal(0.91m, order.Rate);

        var expectedQuote = Math.Round(10.005m * 0.91m, 2, MidpointRounding.AwayFromZero);
        Assert.Equal(expectedQuote, order.QuoteAmount);
    }

    [Fact]
    public async Task UpdateOrderStatusAsync_RejectsInvalidTransition()
    {
        await using var db = new TestDb();

        var baseCurrency = new Currency { Id = Guid.NewGuid(), Code = "USD" };
        var quoteCurrency = new Currency { Id = Guid.NewGuid(), Code = "EUR" };
        db.Context.AddRange(baseCurrency, quoteCurrency);

        var order = new ExchangeOrder
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            BaseCurrencyId = baseCurrency.Id,
            QuoteCurrencyId = quoteCurrency.Id,
            BaseAmount = 1,
            Rate = 1,
            QuoteAmount = 1,
            Status = ExchangeOrderStatus.Completed,
            CreatedAtUtc = DateTime.UtcNow
        };

        db.Context.Add(order);
        await db.Context.SaveChangesAsync();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var result = await service.UpdateOrderStatusAsync(order.Id, ExchangeOrderStatus.Cancelled);

        Assert.False(result.IsSuccess);
        Assert.Equal(UpdateExchangeOrderStatusError.InvalidTransition, result.Error);
    }
}
