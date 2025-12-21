using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Exchange.Domain.Currencies;
using Server.Modules.Exchange.Domain.Rates;
using Server.Modules.Exchange.Infrastructure.Repositories;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Exchange;

public sealed class ExchangeRateRepositoryTests
{
    [Fact]
    public async Task GetLatestForPairAsync_ReturnsMostRecentOrNull()
    {
        await using var db = new TestDb();

        var usd = new Currency { Id = Guid.NewGuid(), Code = "USD" };
        var eur = new Currency { Id = Guid.NewGuid(), Code = "EUR" };
        db.Context.AddRange(usd, eur);

        var old = new ExchangeRateSnapshot
        {
            Id = Guid.NewGuid(),
            BaseCurrencyId = usd.Id,
            QuoteCurrencyId = eur.Id,
            Rate = 0.90m,
            CapturedAtUtc = DateTime.UtcNow.AddMinutes(-10)
        };
        var recent = new ExchangeRateSnapshot
        {
            Id = Guid.NewGuid(),
            BaseCurrencyId = usd.Id,
            QuoteCurrencyId = eur.Id,
            Rate = 0.91m,
            CapturedAtUtc = DateTime.UtcNow
        };

        db.Context.AddRange(old, recent);
        await db.Context.SaveChangesAsync();

        var repo = new ExchangeRateRepository(db.Context);
        var found = await repo.GetLatestForPairAsync(usd.Id, eur.Id);

        Assert.NotNull(found);
        Assert.Equal(recent.Id, found!.Id);

        var missing = await repo.GetLatestForPairAsync(Guid.NewGuid(), Guid.NewGuid());
        Assert.Null(missing);
    }

    [Fact]
    public async Task GetLatestAsync_ReturnsOneSnapshotPerPairSorted()
    {
        await using var db = new TestDb();

        var usd = new Currency { Id = Guid.NewGuid(), Code = "USD" };
        var eur = new Currency { Id = Guid.NewGuid(), Code = "EUR" };
        var gbp = new Currency { Id = Guid.NewGuid(), Code = "GBP" };

        db.Context.AddRange(usd, eur, gbp);

        db.Context.Add(new ExchangeRateSnapshot
        {
            Id = Guid.NewGuid(),
            BaseCurrencyId = usd.Id,
            QuoteCurrencyId = eur.Id,
            Rate = 0.90m,
            CapturedAtUtc = DateTime.UtcNow.AddMinutes(-10)
        });

        var usdEurLatest = new ExchangeRateSnapshot
        {
            Id = Guid.NewGuid(),
            BaseCurrencyId = usd.Id,
            QuoteCurrencyId = eur.Id,
            Rate = 0.91m,
            CapturedAtUtc = DateTime.UtcNow
        };

        db.Context.Add(usdEurLatest);

        var eurGbpLatest = new ExchangeRateSnapshot
        {
            Id = Guid.NewGuid(),
            BaseCurrencyId = eur.Id,
            QuoteCurrencyId = gbp.Id,
            Rate = 0.80m,
            CapturedAtUtc = DateTime.UtcNow
        };

        db.Context.Add(eurGbpLatest);

        await db.Context.SaveChangesAsync();

        var repo = new ExchangeRateRepository(db.Context);
        var list = await repo.GetLatestAsync();

        Assert.Equal(2, list.Count);
        Assert.Contains(list, x => x.Id == usdEurLatest.Id);
        Assert.Contains(list, x => x.Id == eurGbpLatest.Id);

        // Includes should load navigations
        Assert.All(list, x =>
        {
            Assert.NotNull(x.BaseCurrency);
            Assert.NotNull(x.QuoteCurrency);
            Assert.False(string.IsNullOrWhiteSpace(x.BaseCurrency.Code));
            Assert.False(string.IsNullOrWhiteSpace(x.QuoteCurrency.Code));
        });

        var ordered = list.ToList();
        Assert.True(string.CompareOrdinal(ordered[0].BaseCurrency.Code, ordered[1].BaseCurrency.Code) <= 0);
    }
}
