using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Infrastructure.Repositories;
using Server.Tests.Common;

namespace Server.Tests.Modules.Properties;

public sealed class HouseRepositoryTests
{
    [Fact]
    public async Task GetListAsync_ReturnsOrderedWithIncludes()
    {
        await using var db = new TestDb();

        var type = new HouseType { Id = Guid.NewGuid(), Name = "Villa" };
        var location = new Location { Id = Guid.NewGuid(), Country = "IR", City = "Tehran", Region = "Tehran" };
        var address = new Address { Id = Guid.NewGuid(), LocationId = location.Id, Location = location, Line1 = "L1" };

        var a = new House { Id = Guid.NewGuid(), Name = "A", HouseTypeId = type.Id, HouseType = type, AddressId = address.Id, Address = address, CreatedAtUtc = DateTime.UtcNow };
        var b = new House { Id = Guid.NewGuid(), Name = "B", HouseTypeId = type.Id, HouseType = type, AddressId = address.Id, Address = address, CreatedAtUtc = DateTime.UtcNow };

        db.Context.AddRange(type, location, address, b, a);
        await db.Context.SaveChangesAsync();

        var repo = new HouseRepository(db.Context);
        var list = await repo.GetListAsync();

        Assert.Equal(new[] { "A", "B" }, list.Select(x => x.Name).ToArray());
        Assert.All(list, x =>
        {
            Assert.NotNull(x.HouseType);
            Assert.NotNull(x.Address);
            Assert.NotNull(x.Address.Location);
        });
    }

    [Fact]
    public async Task GetDetailAsync_ReturnsNullWhenMissing()
    {
        await using var db = new TestDb();
        var repo = new HouseRepository(db.Context);

        Assert.Null(await repo.GetDetailAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task GetForUpdateAsync_ReturnsTrackedOrNull()
    {
        await using var db = new TestDb();

        var type = new HouseType { Id = Guid.NewGuid(), Name = "Villa" };
        var location = new Location { Id = Guid.NewGuid(), Country = "IR", City = "Tehran" };
        var address = new Address { Id = Guid.NewGuid(), LocationId = location.Id, Location = location, Line1 = "L1" };
        var houseId = Guid.NewGuid();

        db.Context.AddRange(type, location, address, new House { Id = houseId, Name = "H", HouseTypeId = type.Id, HouseType = type, AddressId = address.Id, Address = address, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var repo = new HouseRepository(db.Context);
        Assert.NotNull(await repo.GetForUpdateAsync(houseId));
        Assert.Null(await repo.GetForUpdateAsync(Guid.NewGuid()));
    }
}
