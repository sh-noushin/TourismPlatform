using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Infrastructure.Repositories;
using Server.Tests.Common;

namespace Server.Tests.Modules.Tours;

public sealed class TourPhotoRepositoryCoverageTests
{
    [Fact]
    public async Task GetPhotosByTourIdsAsync_EmptyInput_ReturnsEmptyDictionary()
    {
        await using var db = new TestDb();
        var repo = new TourPhotoRepository(db.Context);

        var map = await repo.GetPhotosByTourIdsAsync(Array.Empty<Guid>());
        Assert.Empty(map);
    }

    [Fact]
    public async Task RemoveLinkAsync_ReturnsFalseWhenMissing_TrueWhenRemoved()
    {
        await using var db = new TestDb();

        var repo = new TourPhotoRepository(db.Context);
        Assert.False(await repo.RemoveLinkAsync(Guid.NewGuid(), Guid.NewGuid()));

        var tourId = Guid.NewGuid();
        var photoId = Guid.NewGuid();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tour = new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow };

        db.Context.AddRange(category, tour);

        db.Context.Add(new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/tours/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });

        db.Context.Add(new TourPhoto { TourId = tourId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        Assert.True(await repo.RemoveLinkAsync(tourId, photoId));
        await db.Context.SaveChangesAsync();

        Assert.False(await db.Context.Set<TourPhoto>().AnyAsync(x => x.TourId == tourId && x.PhotoId == photoId));
    }

    [Fact]
    public async Task LinkExistsAndGetPhotoIds_Work()
    {
        await using var db = new TestDb();

        var tourId = Guid.NewGuid();
        var photoId = Guid.NewGuid();
        var photo = new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/tours/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow };

    var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
    var tour = new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow };

    db.Context.AddRange(category, tour);
        db.Context.Add(photo);
        db.Context.Add(new TourPhoto { TourId = tourId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var repo = new TourPhotoRepository(db.Context);
        Assert.True(await repo.LinkExistsAsync(tourId, photoId));

        var ids = await repo.GetPhotoIdsByTourIdAsync(tourId);
        Assert.Single(ids);
        Assert.Equal(photoId, ids.Single());
    }
}
