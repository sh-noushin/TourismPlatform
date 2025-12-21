using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Infrastructure.Repositories;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Properties;

public sealed class HousePhotoRepositoryTests
{
    [Fact]
    public async Task GetPhotosByHouseIdsAsync_GroupsAndOrdersBySortOrder()
    {
        await using var db = new TestDb();

        var houseType = new HouseType { Id = Guid.NewGuid(), Name = "Villa" };
        var location = new Location { Id = Guid.NewGuid(), Country = "IR", City = "Tehran", Region = "Tehran" };
        var address = new Address { Id = Guid.NewGuid(), LocationId = location.Id, Location = location, Line1 = "Line1" };
        var house = new House { Id = Guid.NewGuid(), Name = "H1", HouseTypeId = houseType.Id, HouseType = houseType, AddressId = address.Id, Address = address, CreatedAtUtc = DateTime.UtcNow };

        var photo1 = new Photo { Id = Guid.NewGuid(), UuidFileName = "p1.jpg", PermanentRelativePath = "images/houses/photos/p1.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow };
        var photo2 = new Photo { Id = Guid.NewGuid(), UuidFileName = "p2.jpg", PermanentRelativePath = "images/houses/photos/p2.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow };

        db.Context.AddRange(houseType, location, address, house, photo1, photo2);
        db.Context.Add(new HousePhoto { HouseId = house.Id, PhotoId = photo2.Id, Label = "B", SortOrder = 2, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new HousePhoto { HouseId = house.Id, PhotoId = photo1.Id, Label = "A", SortOrder = 1, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var repo = new HousePhotoRepository(db.Context);
        var map = await repo.GetPhotosByHouseIdsAsync(new[] { house.Id });

        Assert.True(map.ContainsKey(house.Id));

        var ordered = map[house.Id].ToList();
        Assert.Equal(2, ordered.Count);
        Assert.Equal(photo1.Id, ordered[0].PhotoId);
        Assert.Equal(photo2.Id, ordered[1].PhotoId);
    }
}
