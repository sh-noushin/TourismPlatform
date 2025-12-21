using Server.Modules.Exchange.Application.Services;
using Server.Modules.Exchange.Contracts.Exchange.Dtos;
using Server.Modules.Exchange.Contracts.Exchange.Services;
using Server.Modules.Exchange.Domain.Currencies;
using Server.Modules.Exchange.Domain.Orders;
using Server.Modules.Exchange.Domain.Rates;
using Server.Modules.Exchange.Infrastructure.Repositories;
using Server.Tests.Common;

namespace Server.Tests.Modules.Exchange;

public sealed class ExchangeServiceCoverageTests
{
    [Fact]
    public async Task GetCurrenciesAsync_ReturnsSortedDtos()
    {
        await using var db = new TestDb();
        db.Context.AddRange(
            new Currency { Id = Guid.NewGuid(), Code = "EUR" },
            new Currency { Id = Guid.NewGuid(), Code = "USD" });
        await db.Context.SaveChangesAsync();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var list = await service.GetCurrenciesAsync();
        var items = list.ToArray();

        Assert.Equal(2, list.Count);
        Assert.Equal("EUR", items[0].Code);
        Assert.Equal("USD", items[1].Code);
    }

    [Fact]
    public async Task GetLatestRatesAsync_ReturnsLatestPerPair()
    {
        await using var db = new TestDb();

        var usd = new Currency { Id = Guid.NewGuid(), Code = "USD" };
        var eur = new Currency { Id = Guid.NewGuid(), Code = "EUR" };
        db.Context.AddRange(usd, eur);

        db.Context.Add(new ExchangeRateSnapshot
        {
            Id = Guid.NewGuid(),
            BaseCurrencyId = usd.Id,
            QuoteCurrencyId = eur.Id,
            Rate = 0.90m,
            CapturedAtUtc = DateTime.UtcNow.AddMinutes(-10)
        });

        db.Context.Add(new ExchangeRateSnapshot
        {
            Id = Guid.NewGuid(),
            BaseCurrencyId = usd.Id,
            QuoteCurrencyId = eur.Id,
            Rate = 0.91m,
            CapturedAtUtc = DateTime.UtcNow
        });

        await db.Context.SaveChangesAsync();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var rates = await service.GetLatestRatesAsync();
        var items = rates.ToArray();

        Assert.Single(rates);
        Assert.Equal("USD", items[0].BaseCurrencyCode);
        Assert.Equal("EUR", items[0].QuoteCurrencyCode);
        Assert.Equal(0.91m, items[0].Rate);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task CreateOrderAsync_InvalidBaseAmount_ReturnsInvalid(decimal baseAmount)
    {
        await using var db = new TestDb();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var result = await service.CreateOrderAsync(Guid.NewGuid(), new CreateExchangeOrderRequest("USD", "EUR", baseAmount));

        Assert.False(result.IsSuccess);
        Assert.Equal(CreateExchangeOrderError.Invalid, result.Error);
        Assert.Null(result.OrderId);
    }

    [Theory]
    [InlineData("US", "EUR")]
    [InlineData("USD", "EU")]
    [InlineData("", "EUR")]
    [InlineData("USD", "")]
    [InlineData("USD", "USD")]
    public async Task CreateOrderAsync_InvalidCodes_ReturnsInvalid(string baseCode, string quoteCode)
    {
        await using var db = new TestDb();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var result = await service.CreateOrderAsync(Guid.NewGuid(), new CreateExchangeOrderRequest(baseCode, quoteCode, 1));

        Assert.False(result.IsSuccess);
        Assert.Equal(CreateExchangeOrderError.Invalid, result.Error);
    }

    [Fact]
    public async Task CreateOrderAsync_MissingCurrency_ReturnsCurrencyNotFound()
    {
        await using var db = new TestDb();

        db.Context.Add(new Currency { Id = Guid.NewGuid(), Code = "USD" });
        await db.Context.SaveChangesAsync();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var result = await service.CreateOrderAsync(Guid.NewGuid(), new CreateExchangeOrderRequest("USD", "EUR", 1));

        Assert.False(result.IsSuccess);
        Assert.Equal(CreateExchangeOrderError.CurrencyNotFound, result.Error);
    }

    [Fact]
    public async Task CreateOrderAsync_MissingRate_ReturnsRateNotFound()
    {
        await using var db = new TestDb();

        var usd = new Currency { Id = Guid.NewGuid(), Code = "USD" };
        var eur = new Currency { Id = Guid.NewGuid(), Code = "EUR" };
        db.Context.AddRange(usd, eur);
        await db.Context.SaveChangesAsync();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var result = await service.CreateOrderAsync(Guid.NewGuid(), new CreateExchangeOrderRequest("USD", "EUR", 1));

        Assert.False(result.IsSuccess);
        Assert.Equal(CreateExchangeOrderError.RateNotFound, result.Error);
    }

    [Fact]
    public async Task UpdateOrderStatusAsync_InvalidStatus_ReturnsInvalid()
    {
        await using var db = new TestDb();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var result = await service.UpdateOrderStatusAsync(Guid.NewGuid(), (ExchangeOrderStatus)123);

        Assert.False(result.IsSuccess);
        Assert.Equal(UpdateExchangeOrderStatusError.Invalid, result.Error);
    }

    [Fact]
    public async Task UpdateOrderStatusAsync_NotFound_ReturnsNotFound()
    {
        await using var db = new TestDb();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var result = await service.UpdateOrderStatusAsync(Guid.NewGuid(), ExchangeOrderStatus.Cancelled);

        Assert.False(result.IsSuccess);
        Assert.Equal(UpdateExchangeOrderStatusError.NotFound, result.Error);
    }

    [Fact]
    public async Task UpdateOrderStatusAsync_SucceedsForPendingOrder()
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
            Status = ExchangeOrderStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };

        db.Context.Add(order);
        await db.Context.SaveChangesAsync();

        var service = new ExchangeService(
            db.Context,
            new CurrencyRepository(db.Context),
            new ExchangeRateRepository(db.Context),
            new ExchangeOrderRepository(db.Context));

        var result = await service.UpdateOrderStatusAsync(order.Id, ExchangeOrderStatus.Completed);

        Assert.True(result.IsSuccess);

        var updated = await db.Context.Set<ExchangeOrder>().FindAsync(order.Id);
        Assert.Equal(ExchangeOrderStatus.Completed, updated!.Status);
        Assert.NotNull(updated.UpdatedAtUtc);
    }
}
