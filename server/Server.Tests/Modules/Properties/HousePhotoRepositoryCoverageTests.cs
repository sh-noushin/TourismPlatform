using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Infrastructure.Repositories;
using Server.Tests.Common;

namespace Server.Tests.Modules.Properties;

public sealed class HousePhotoRepositoryCoverageTests
{
    [Fact]
    public async Task GetPhotosByHouseIdsAsync_EmptyInput_ReturnsEmpty()
    {
        await using var db = new TestDb();
        var repo = new HousePhotoRepository(db.Context);

        var map = await repo.GetPhotosByHouseIdsAsync(Array.Empty<Guid>());
        Assert.Empty(map);
    }

    [Fact]
    public async Task RemoveLinkAsync_ReturnsFalseWhenMissing_TrueWhenRemoved()
    {
        await using var db = new TestDb();
        var repo = new HousePhotoRepository(db.Context);

        Assert.False(await repo.RemoveLinkAsync(Guid.NewGuid(), Guid.NewGuid()));

        var houseId = Guid.NewGuid();
        var photoId = Guid.NewGuid();

        var location = new Location { Id = Guid.NewGuid(), Country = "X", City = "Y" };
        var address = new Address { Id = Guid.NewGuid(), LocationId = location.Id, Line1 = "L1" };
        var type = new HouseType { Id = Guid.NewGuid(), Name = "Apartment" };
        var house = new House { Id = houseId, Name = "H", HouseTypeId = type.Id, AddressId = address.Id, CreatedAtUtc = DateTime.UtcNow };

        db.Context.AddRange(location, address, type, house);

        db.Context.Add(new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/houses/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });

        db.Context.Add(new HousePhoto { HouseId = houseId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        Assert.True(await repo.RemoveLinkAsync(houseId, photoId));
        await db.Context.SaveChangesAsync();

        Assert.False(await db.Context.Set<HousePhoto>().AnyAsync(x => x.HouseId == houseId && x.PhotoId == photoId));
    }

    [Fact]
    public async Task LinkExistsAndGetPhotoIds_Work()
    {
        await using var db = new TestDb();

        var houseId = Guid.NewGuid();
        var photoId = Guid.NewGuid();
        var photo = new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/houses/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow };

    var location = new Location { Id = Guid.NewGuid(), Country = "X", City = "Y" };
    var address = new Address { Id = Guid.NewGuid(), LocationId = location.Id, Line1 = "L1" };
    var type = new HouseType { Id = Guid.NewGuid(), Name = "Apartment" };
    var house = new House { Id = houseId, Name = "H", HouseTypeId = type.Id, AddressId = address.Id, CreatedAtUtc = DateTime.UtcNow };

    db.Context.AddRange(location, address, type, house);
        db.Context.Add(photo);
        db.Context.Add(new HousePhoto { HouseId = houseId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var repo = new HousePhotoRepository(db.Context);
        Assert.True(await repo.LinkExistsAsync(houseId, photoId));

        var ids = await repo.GetPhotoIdsByHouseIdAsync(houseId);
        Assert.Single(ids);
        Assert.Equal(photoId, ids.Single());
    }
}
