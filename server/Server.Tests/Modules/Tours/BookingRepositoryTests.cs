using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Infrastructure.Repositories;
using Server.Tests.Common;

namespace Server.Tests.Modules.Tours;

public sealed class BookingRepositoryTests
{
    [Fact]
    public async Task GetBookedSeatsAsync_ReturnsSumOrZero()
    {
        await using var db = new TestDb();

        var scheduleId = Guid.NewGuid();
        var otherScheduleId = Guid.NewGuid();
        var tourId = Guid.NewGuid();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tour = new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow };
        var schedule = new TourSchedule { Id = scheduleId, TourId = tourId, StartAtUtc = DateTime.UtcNow, EndAtUtc = DateTime.UtcNow.AddHours(1), Capacity = 10, CreatedAtUtc = DateTime.UtcNow };
        var otherSchedule = new TourSchedule { Id = otherScheduleId, TourId = tourId, StartAtUtc = DateTime.UtcNow.AddDays(1), EndAtUtc = DateTime.UtcNow.AddDays(1).AddHours(1), Capacity = 10, CreatedAtUtc = DateTime.UtcNow };

        db.Context.AddRange(category, tour, schedule, otherSchedule);

        db.Context.AddRange(
            new Booking { Id = Guid.NewGuid(), TourId = tourId, TourScheduleId = scheduleId, UserId = Guid.NewGuid(), Seats = 2, CreatedAtUtc = DateTime.UtcNow },
            new Booking { Id = Guid.NewGuid(), TourId = tourId, TourScheduleId = scheduleId, UserId = Guid.NewGuid(), Seats = 3, CreatedAtUtc = DateTime.UtcNow },
            new Booking { Id = Guid.NewGuid(), TourId = tourId, TourScheduleId = otherScheduleId, UserId = Guid.NewGuid(), Seats = 100, CreatedAtUtc = DateTime.UtcNow }
        );

        await db.Context.SaveChangesAsync();

        var repo = new BookingRepository(db.Context);
        var sum = await repo.GetBookedSeatsAsync(scheduleId);

        Assert.Equal(5, sum);

        var zero = await repo.GetBookedSeatsAsync(Guid.NewGuid());
        Assert.Equal(0, zero);
    }
}
