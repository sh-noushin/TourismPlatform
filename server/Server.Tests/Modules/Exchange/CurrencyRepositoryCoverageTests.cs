using Server.Modules.Exchange.Domain.Currencies;
using Server.Modules.Exchange.Infrastructure.Repositories;
using Server.Tests.Common;

namespace Server.Tests.Modules.Exchange;

public sealed class CurrencyRepositoryCoverageTests
{
    [Fact]
    public async Task GetListAsync_ReturnsSorted()
    {
        await using var db = new TestDb();

        db.Context.AddRange(
            new Currency { Id = Guid.NewGuid(), Code = "EUR" },
            new Currency { Id = Guid.NewGuid(), Code = "USD" });

        await db.Context.SaveChangesAsync();

        var repo = new CurrencyRepository(db.Context);
        var list = await repo.GetListAsync();

        Assert.Equal(new[] { "EUR", "USD" }, list.Select(x => x.Code).ToArray());
    }

    [Fact]
    public async Task GetByCodeAsync_ReturnsNullForInvalidCode()
    {
        await using var db = new TestDb();

        var repo = new CurrencyRepository(db.Context);
        var found = await repo.GetByCodeAsync("XXX");
        Assert.Null(found);
    }

    [Fact]
    public async Task GetByCodeAsync_ReturnsCurrencyForValidCode()
    {
        await using var db = new TestDb();

        var currency = new Currency { Id = Guid.NewGuid(), Code = "USD" };
        db.Context.Add(currency);
        await db.Context.SaveChangesAsync();

        var repo = new CurrencyRepository(db.Context);
        var found = await repo.GetByCodeAsync(" usd ");

        Assert.NotNull(found);
        Assert.Equal(currency.Id, found!.Id);
    }
}
