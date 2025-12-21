using System;
using System.Linq;
using System.Threading.Tasks;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Infrastructure.Repositories;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Tours;

public sealed class TourScheduleRepositoryTests
{
    [Fact]
    public async Task GetByTourIdAsync_ReturnsSortedSchedules()
    {
        await using var db = new TestDb();

        var tourId = Guid.NewGuid();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tour = new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow };
        var otherTourId = Guid.NewGuid();
        var otherTour = new Tour { Id = otherTourId, Name = "T2", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow };
        db.Context.AddRange(category, tour, otherTour);

        db.Context.AddRange(
            new TourSchedule { Id = Guid.NewGuid(), TourId = tourId, StartAtUtc = DateTime.UtcNow.AddDays(2), EndAtUtc = DateTime.UtcNow.AddDays(2).AddHours(1), Capacity = 1, CreatedAtUtc = DateTime.UtcNow },
            new TourSchedule { Id = Guid.NewGuid(), TourId = tourId, StartAtUtc = DateTime.UtcNow.AddDays(1), EndAtUtc = DateTime.UtcNow.AddDays(1).AddHours(1), Capacity = 1, CreatedAtUtc = DateTime.UtcNow },
            new TourSchedule { Id = Guid.NewGuid(), TourId = otherTourId, StartAtUtc = DateTime.UtcNow, EndAtUtc = DateTime.UtcNow.AddHours(1), Capacity = 1, CreatedAtUtc = DateTime.UtcNow }
        );
        await db.Context.SaveChangesAsync();

        var repo = new TourScheduleRepository(db.Context);
        var list = await repo.GetByTourIdAsync(tourId);

        Assert.Equal(2, list.Count);
        Assert.True(list.First().StartAtUtc <= list.Last().StartAtUtc);
    }

    [Fact]
    public async Task GetDetailAndForUpdate_ReturnNullIfMissing()
    {
        await using var db = new TestDb();

        var repo = new TourScheduleRepository(db.Context);
        Assert.Null(await repo.GetDetailAsync(Guid.NewGuid()));
        Assert.Null(await repo.GetForUpdateAsync(Guid.NewGuid()));
    }
}
