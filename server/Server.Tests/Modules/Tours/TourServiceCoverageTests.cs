using Moq;
using Server.Modules.Media.Application.Services;
using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Media.Domain.Uploads;
using Server.Modules.Tours.Application.Services;
using Server.Modules.Tours.Contracts.Tours.Dtos;
using Server.Modules.Tours.Contracts.Tours.Services;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Infrastructure.Repositories;
using Server.SharedKernel.Media;
using Server.Tests.Common;

namespace Server.Tests.Modules.Tours;

public sealed class TourServiceCoverageTests
{
    [Fact]
    public async Task GetListAsync_ReturnsEmpty_WhenNoTours()
    {
        await using var db = new TestDb();

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        var list = await service.GetListAsync();
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetListAndDetailAsync_ReturnsPhotosAndSchedules()
    {
        await using var db = new TestDb();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tourId = Guid.NewGuid();
        var tour = new Tour { Id = tourId, Name = "T", Description = "D", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow };
        var scheduleId = Guid.NewGuid();
        var schedule = new TourSchedule
        {
            Id = scheduleId,
            TourId = tourId,
            StartAtUtc = DateTime.UtcNow.AddDays(1),
            EndAtUtc = DateTime.UtcNow.AddDays(1).AddHours(1),
            Capacity = 10,
            CreatedAtUtc = DateTime.UtcNow
        };
        var photoId = Guid.NewGuid();

        db.Context.AddRange(category, tour, schedule);
        db.Context.Add(new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/tours/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new TourPhoto { TourId = tourId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        var list = await service.GetListAsync();
        Assert.Single(list);
        Assert.Equal(tourId, list.Single().TourId);
        Assert.Single(list.Single().Photos);

        var detail = await service.GetDetailAsync(tourId);
        Assert.NotNull(detail);
        Assert.Single(detail!.Schedules);
        Assert.Single(detail.Photos);
    }

    [Fact]
    public async Task CreateAsync_CreatesTour_AndLinksCommittedPhotos()
    {
        await using var db = new TestDb();

        var photoId = Guid.NewGuid();

        var photoCommit = new Mock<IPhotoCommitService>(MockBehavior.Strict);
        photoCommit
            .Setup(s => s.CommitAsync(
                It.IsAny<IReadOnlyCollection<CommitPhotoItem>>(),
                It.IsAny<CancellationToken>()))
            .ReturnsAsync((IReadOnlyCollection<CommitPhotoItem> items, CancellationToken _) =>
            {
                // Simulate commit service creating the Photo row so FK constraints pass.
                db.Context.Add(new Photo
                {
                    Id = photoId,
                    UuidFileName = "p.jpg",
                    PermanentRelativePath = "images/tours/photos/p.jpg",
                    ContentType = "image/jpeg",
                    FileSize = 1,
                    CreatedAtUtc = DateTime.UtcNow
                });
                db.Context.SaveChanges();

                var request = items.Single();
                Assert.Equal(StagedUploadTargetType.Tour, request.TargetType);

                return new[]
                {
                    new PhotoCommitResult(photoId, request.Label, request.SortOrder, "images/tours/photos/p.jpg", request.TargetType)
                };
            });

        var photoCleanup = new Mock<IPhotoCleanupService>(MockBehavior.Loose);

        var service = new TourService(
            db.Context,
            photoCommit.Object,
            photoCleanup.Object,
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        var stagedUploadId = Guid.NewGuid();
        var tourId = await service.CreateAsync(
            new CreateTourRequest(
                Name: "  My Tour ",
                Description: "d",
                TourCategoryName: "  Adventure ",
                Price: 123.45m,
                Currency: "USD",
                CountryCode: "US",
                Photos: new[] { new TourCommitPhotoItem(stagedUploadId, "L", 1) }),
            currentUserId: Guid.NewGuid());

        var created = await db.Context.Set<Tour>().FindAsync(tourId);
        Assert.NotNull(created);
        Assert.Equal("My Tour", created!.Name);

        var link = db.Context.Set<TourPhoto>().Single(x => x.TourId == tourId && x.PhotoId == photoId);
        Assert.Equal("L", link.Label);
        Assert.Equal(1, link.SortOrder);
    }

    [Fact]
    public async Task UpdateAsync_ReturnsFalse_WhenTourMissing()
    {
        await using var db = new TestDb();

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        var ok = await service.UpdateAsync(
            Guid.NewGuid(),
            new UpdateTourRequest("N", "d", "C", 1m, "USD", "US", Photos: null),
            currentUserId: null);

        Assert.False(ok);
    }

    [Fact]
    public async Task UpdateAsync_UpdatesTour_WhenExists()
    {
        await using var db = new TestDb();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tourId = Guid.NewGuid();
        db.Context.AddRange(category, new Tour { Id = tourId, Name = "Old", Description = "d", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var photoCommit = new Mock<IPhotoCommitService>(MockBehavior.Strict);

        var service = new TourService(
            db.Context,
            photoCommit.Object,
            Mock.Of<IPhotoCleanupService>(),
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        var ok = await service.UpdateAsync(
            tourId,
            new UpdateTourRequest("  New ", "d2", "  C2 ", 20.5m, "EUR", "US", Photos: Array.Empty<TourCommitPhotoItem>()),
            currentUserId: Guid.NewGuid());

        Assert.True(ok);
        var updated = await db.Context.Set<Tour>().FindAsync(tourId);
        Assert.Equal("New", updated!.Name);

        photoCommit.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task DeleteAsync_ReturnsFalse_WhenTourMissing()
    {
        await using var db = new TestDb();

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            cleanup.Object,
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        Assert.False(await service.DeleteAsync(Guid.NewGuid()));
        cleanup.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task DeleteAsync_DeletesTour_AndCleansUpLinkedPhotos()
    {
        await using var db = new TestDb();

        var photoId = Guid.NewGuid();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tourId = Guid.NewGuid();
        var tour = new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow };

        db.Context.AddRange(category, tour);
        db.Context.Add(new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/tours/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new TourPhoto { TourId = tourId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);
        cleanup.Setup(s => s.CleanupOrphanedPhotosAsync(It.Is<IReadOnlyCollection<Guid>>(ids => ids.Count == 1 && ids.Contains(photoId)), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Guid>());

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            cleanup.Object,
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        Assert.True(await service.DeleteAsync(tourId));

        Assert.Null(await db.Context.Set<Tour>().FindAsync(tourId));
        cleanup.VerifyAll();
    }

    [Fact]
    public async Task UnlinkPhotoAsync_ReturnsFalse_WhenTourMissingOrLinkMissing()
    {
        await using var db = new TestDb();

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            cleanup.Object,
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        Assert.False(await service.UnlinkPhotoAsync(Guid.NewGuid(), Guid.NewGuid()));

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tourId = Guid.NewGuid();
        db.Context.AddRange(category, new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        Assert.False(await service.UnlinkPhotoAsync(tourId, Guid.NewGuid()));
        cleanup.VerifyNoOtherCalls();
    }

    [Fact]
    public async Task UnlinkPhotoAsync_RemovesLink_AndCleansUpPhoto()
    {
        await using var db = new TestDb();

        var photoId = Guid.NewGuid();
        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tourId = Guid.NewGuid();

        db.Context.AddRange(category, new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new Photo { Id = photoId, UuidFileName = "p.jpg", PermanentRelativePath = "images/tours/photos/p.jpg", ContentType = "image/jpeg", FileSize = 1, CreatedAtUtc = DateTime.UtcNow });
        db.Context.Add(new TourPhoto { TourId = tourId, PhotoId = photoId, Label = "L", SortOrder = 0, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var cleanup = new Mock<IPhotoCleanupService>(MockBehavior.Strict);
        cleanup.Setup(s => s.CleanupOrphanedPhotosAsync(It.Is<IReadOnlyCollection<Guid>>(ids => ids.Count == 1 && ids.Contains(photoId)), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Array.Empty<Guid>());

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            cleanup.Object,
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        Assert.True(await service.UnlinkPhotoAsync(tourId, photoId));
        Assert.False(db.Context.Set<TourPhoto>().Any(x => x.TourId == tourId && x.PhotoId == photoId));

        cleanup.VerifyAll();
    }

    [Fact]
    public async Task ScheduleCrud_Works()
    {
        await using var db = new TestDb();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tourId = Guid.NewGuid();
        db.Context.AddRange(category, new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow });
        await db.Context.SaveChangesAsync();

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        var start = DateTime.UtcNow.AddDays(1);
        var end = start.AddHours(1);

        var scheduleId = await service.CreateScheduleAsync(tourId, new CreateTourScheduleRequest(start, end, Capacity: 5));
        Assert.NotNull(scheduleId);

        Assert.False(await service.UpdateScheduleAsync(Guid.NewGuid(), new UpdateTourScheduleRequest(start, end, Capacity: 5)));
        Assert.False(await service.UpdateScheduleAsync(scheduleId.Value, new UpdateTourScheduleRequest(start, end, Capacity: 0)));

        Assert.True(await service.UpdateScheduleAsync(scheduleId.Value, new UpdateTourScheduleRequest(start.AddHours(1), end.AddHours(1), Capacity: 6)));

        Assert.False(await service.DeleteScheduleAsync(Guid.NewGuid()));
        Assert.True(await service.DeleteScheduleAsync(scheduleId.Value));
    }

    [Fact]
    public async Task BookAsync_CoversInvalidNotFoundAndSuccessPaths()
    {
        await using var db = new TestDb();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tourId = Guid.NewGuid();
        var tour = new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow };

        db.Context.AddRange(category, tour);

        var scheduleId = Guid.NewGuid();
        db.Context.Add(new TourSchedule
        {
            Id = scheduleId,
            TourId = tourId,
            StartAtUtc = DateTime.UtcNow.AddDays(1),
            EndAtUtc = DateTime.UtcNow.AddDays(1).AddHours(1),
            Capacity = 5,
            CreatedAtUtc = DateTime.UtcNow
        });

        await db.Context.SaveChangesAsync();

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        var invalid = await service.BookAsync(tourId, Guid.NewGuid(), new CreateBookingRequest(scheduleId, Seats: 0));
        Assert.False(invalid.IsSuccess);
        Assert.Equal(BookTourError.Invalid, invalid.Error);

        var notFoundTour = await service.BookAsync(Guid.NewGuid(), Guid.NewGuid(), new CreateBookingRequest(scheduleId, Seats: 1));
        Assert.False(notFoundTour.IsSuccess);
        Assert.Equal(BookTourError.NotFound, notFoundTour.Error);

        var notFoundSchedule = await service.BookAsync(tourId, Guid.NewGuid(), new CreateBookingRequest(Guid.NewGuid(), Seats: 1));
        Assert.False(notFoundSchedule.IsSuccess);
        Assert.Equal(BookTourError.NotFound, notFoundSchedule.Error);

        var booking = await service.BookAsync(tourId, Guid.NewGuid(), new CreateBookingRequest(scheduleId, Seats: 2));
        Assert.True(booking.IsSuccess);
        Assert.NotNull(booking.BookingId);
    }

    [Fact]
    public async Task BookAsync_ReturnsCapacityExceeded_WhenOverCapacity()
    {
        await using var db = new TestDb();

        var category = new TourCategory { Id = Guid.NewGuid(), Name = "C" };
        var tourId = Guid.NewGuid();
        db.Context.AddRange(category, new Tour { Id = tourId, Name = "T", TourCategoryId = category.Id, CreatedAtUtc = DateTime.UtcNow });

        var scheduleId = Guid.NewGuid();
        db.Context.Add(new TourSchedule
        {
            Id = scheduleId,
            TourId = tourId,
            StartAtUtc = DateTime.UtcNow.AddDays(1),
            EndAtUtc = DateTime.UtcNow.AddDays(1).AddHours(1),
            Capacity = 2,
            CreatedAtUtc = DateTime.UtcNow
        });

        // Fully booked already.
        db.Context.Add(new Booking
        {
            Id = Guid.NewGuid(),
            TourId = tourId,
            TourScheduleId = scheduleId,
            UserId = Guid.NewGuid(),
            Seats = 2,
            CreatedAtUtc = DateTime.UtcNow
        });

        await db.Context.SaveChangesAsync();

        var service = new TourService(
            db.Context,
            Mock.Of<IPhotoCommitService>(),
            Mock.Of<IPhotoCleanupService>(),
            new TourRepository(db.Context),
            new TourReferenceDataRepository(db.Context),
            new TourPhotoRepository(db.Context),
            new TourScheduleRepository(db.Context),
            new BookingRepository(db.Context));

        var result = await service.BookAsync(tourId, Guid.NewGuid(), new CreateBookingRequest(scheduleId, Seats: 1));
        Assert.False(result.IsSuccess);
        Assert.Equal(BookTourError.CapacityExceeded, result.Error);
    }
}
