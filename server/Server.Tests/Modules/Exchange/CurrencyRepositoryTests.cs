using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Exchange.Domain.Currencies;
using Server.Modules.Exchange.Infrastructure.Repositories;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Exchange;

public sealed class CurrencyRepositoryTests
{
    [Fact]
    public async Task GetByCodesAsync_ReturnsDictionaryByNormalizedCodes()
    {
        await using var db = new TestDb();

        db.Context.Add(new Currency { Id = Guid.NewGuid(), Code = "USD" });
        db.Context.Add(new Currency { Id = Guid.NewGuid(), Code = "EUR" });
        await db.Context.SaveChangesAsync();

        var repo = new CurrencyRepository(db.Context);
        var map = await repo.GetByCodesAsync(new[] { " usd ", "EUR", "USD", "gbp" });

        Assert.True(map.ContainsKey("USD"));
        Assert.True(map.ContainsKey("EUR"));
        Assert.Equal(2, map.Count);
    }
}
