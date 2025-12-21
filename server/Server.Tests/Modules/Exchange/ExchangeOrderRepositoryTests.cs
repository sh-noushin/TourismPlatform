using Server.Modules.Exchange.Domain.Currencies;
using Server.Modules.Exchange.Domain.Orders;
using Server.Modules.Exchange.Infrastructure.Repositories;
using Server.Tests.Common;

namespace Server.Tests.Modules.Exchange;

public sealed class ExchangeOrderRepositoryTests
{
    [Fact]
    public async Task GetForUpdateAsync_ReturnsEntityOrNull()
    {
        await using var db = new TestDb();

        var usd = new Currency { Id = Guid.NewGuid(), Code = "USD" };
        var eur = new Currency { Id = Guid.NewGuid(), Code = "EUR" };
        db.Context.AddRange(usd, eur);

        var order = new ExchangeOrder
        {
            Id = Guid.NewGuid(),
            UserId = Guid.NewGuid(),
            BaseCurrencyId = usd.Id,
            QuoteCurrencyId = eur.Id,
            BaseAmount = 1,
            Rate = 1,
            QuoteAmount = 1,
            Status = ExchangeOrderStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow
        };

        db.Context.Add(order);
        await db.Context.SaveChangesAsync();

        var repo = new ExchangeOrderRepository(db.Context);

        var found = await repo.GetForUpdateAsync(order.Id);
        Assert.NotNull(found);

        var missing = await repo.GetForUpdateAsync(Guid.NewGuid());
        Assert.Null(missing);
    }
}
