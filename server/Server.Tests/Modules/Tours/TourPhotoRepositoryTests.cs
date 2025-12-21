using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Infrastructure.Repositories;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Tours;

public sealed class TourPhotoRepositoryTests
{
    [Fact]
    public async Task GetPhotosByTourIdsAsync_GroupsAndOrdersBySortOrder()
    {
        await using var db = new TestDb();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "Adventure" };
        var tour1 = new Tour { Id = Guid.NewGuid(), Name = "T1", TourCategoryId = category.Id, TourCategory = category, CreatedAtUtc = DateTime.UtcNow };
        var tour2 = new Tour { Id = Guid.NewGuid(), Name = "T2", TourCategoryId = category.Id, TourCategory = category, CreatedAtUtc = DateTime.UtcNow };

        var photoA = new Photo { Id = Guid.NewGuid(), UuidFileName = "a.jpg", PermanentRelativePath = "images/tours/photos/a.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow };
        var photoB = new Photo { Id = Guid.NewGuid(), UuidFileName = "b.jpg", PermanentRelativePath = "images/tours/photos/b.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow };

        db.Context.AddRange(category, tour1, tour2, photoA, photoB);
        db.Context.Add(new TourPhoto { TourId = tour1.Id, PhotoId = photoB.Id, Label = "B", SortOrder = 2, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new TourPhoto { TourId = tour1.Id, PhotoId = photoA.Id, Label = "A", SortOrder = 1, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var repo = new TourPhotoRepository(db.Context);
        var map = await repo.GetPhotosByTourIdsAsync(new[] { tour1.Id, tour2.Id });

        Assert.True(map.ContainsKey(tour1.Id));
        Assert.False(map.ContainsKey(tour2.Id));

        var ordered = map[tour1.Id].ToList();
        Assert.Equal(2, ordered.Count);
        Assert.Equal(photoA.Id, ordered[0].PhotoId);
        Assert.Equal(photoB.Id, ordered[1].PhotoId);
    }
}
