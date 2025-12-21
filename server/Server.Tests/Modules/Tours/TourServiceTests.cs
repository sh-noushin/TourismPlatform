using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Server.Modules.Media.Application.Services;
using Server.Modules.Tours.Application.Services;
using Server.Modules.Tours.Contracts.Tours.Dtos;
using Server.Modules.Tours.Contracts.Tours.Services;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Domain.Tours.Repositories;
using Server.SharedKernel.Media;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Tours;

public sealed class TourServiceTests
{
    [Fact]
    public async Task BookAsync_RejectsCapacityExceeded()
    {
        await using var db = new TestDb();

        var tourId = Guid.NewGuid();
        var scheduleId = Guid.NewGuid();

        var photoCommit = new Mock<IPhotoCommitService>(MockBehavior.Strict);
        var photoCleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);

        var tourRepo = new Mock<ITourRepository>(MockBehavior.Strict);
        tourRepo.Setup(r => r.GetDetailAsync(tourId, default))
            .ReturnsAsync(new Tour { Id = tourId, Name = "T", TourCategoryId = Guid.NewGuid(), TourCategory = new TourCategory { Id = Guid.NewGuid(), Name = "C" }, CreatedAtUtc = DateTime.UtcNow });

        var refRepo = new Mock<ITourReferenceDataRepository>(MockBehavior.Strict);
        var tourPhotoRepo = new Mock<ITourPhotoRepository>(MockBehavior.Strict);

        var scheduleRepo = new Mock<ITourScheduleRepository>(MockBehavior.Strict);
        scheduleRepo.Setup(r => r.GetDetailAsync(scheduleId, default))
            .ReturnsAsync(new TourSchedule { Id = scheduleId, TourId = tourId, StartAtUtc = DateTime.UtcNow, EndAtUtc = DateTime.UtcNow.AddHours(1), Capacity = 10, CreatedAtUtc = DateTime.UtcNow });

        var bookingRepo = new Mock<IBookingRepository>(MockBehavior.Strict);
        bookingRepo.Setup(r => r.GetBookedSeatsAsync(scheduleId, default)).ReturnsAsync(9);

        var service = new TourService(
            db.Context,
            photoCommit.Object,
            photoCleanup.Object,
            tourRepo.Object,
            refRepo.Object,
            tourPhotoRepo.Object,
            scheduleRepo.Object,
            bookingRepo.Object);

        var result = await service.BookAsync(tourId, Guid.NewGuid(), new CreateBookingRequest(scheduleId, Seats: 2));

        Assert.False(result.IsSuccess);
        Assert.Equal(BookTourError.CapacityExceeded, result.Error);

        bookingRepo.Verify(r => r.CreateAsync(It.IsAny<Booking>(), default), Times.Never);
    }

    [Fact]
    public async Task CreateScheduleAsync_RejectsInvalidCapacityOrDates()
    {
        await using var db = new TestDb();

        var photoCommit = new Mock<IPhotoCommitService>(MockBehavior.Loose);
        var photoCleanup = new Mock<IPhotoCleanupService>(MockBehavior.Loose);

        var tourRepo = new Mock<ITourRepository>(MockBehavior.Loose);
        var refRepo = new Mock<ITourReferenceDataRepository>(MockBehavior.Loose);
        var tourPhotoRepo = new Mock<ITourPhotoRepository>(MockBehavior.Loose);
        var scheduleRepo = new Mock<ITourScheduleRepository>(MockBehavior.Loose);
        var bookingRepo = new Mock<IBookingRepository>(MockBehavior.Loose);

        var service = new TourService(
            db.Context,
            photoCommit.Object,
            photoCleanup.Object,
            tourRepo.Object,
            refRepo.Object,
            tourPhotoRepo.Object,
            scheduleRepo.Object,
            bookingRepo.Object);

        var invalidCapacity = await service.CreateScheduleAsync(Guid.NewGuid(), new CreateTourScheduleRequest(DateTime.UtcNow, DateTime.UtcNow.AddHours(1), Capacity: 0));
        Assert.Null(invalidCapacity);

        var invalidDates = await service.CreateScheduleAsync(Guid.NewGuid(), new CreateTourScheduleRequest(DateTime.UtcNow.AddHours(2), DateTime.UtcNow.AddHours(1), Capacity: 1));
        Assert.Null(invalidDates);
    }
}
