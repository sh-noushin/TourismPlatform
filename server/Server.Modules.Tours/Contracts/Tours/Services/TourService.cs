using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Application.Services;
using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Domain.Uploads;
using Server.Modules.Tours.Application.Services;
using Server.Modules.Tours.Contracts.Tours.Dtos;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Domain.Tours.Repositories;

namespace Server.Modules.Tours.Contracts.Tours.Services;

public sealed class TourService : ITourService
{
    private readonly DbContext _dbContext;
    private readonly IPhotoCommitService _photoCommitService;
    private readonly ITourRepository _tourRepository;
    private readonly ITourReferenceDataRepository _referenceDataRepository;
    private readonly ITourPhotoRepository _tourPhotoRepository;
    private readonly ITourScheduleRepository _tourScheduleRepository;
    private readonly IBookingRepository _bookingRepository;

    public TourService(
        DbContext dbContext,
        IPhotoCommitService photoCommitService,
        ITourRepository tourRepository,
        ITourReferenceDataRepository referenceDataRepository,
        ITourPhotoRepository tourPhotoRepository,
        ITourScheduleRepository tourScheduleRepository,
        IBookingRepository bookingRepository)
    {
        _dbContext = dbContext;
        _photoCommitService = photoCommitService;
        _tourRepository = tourRepository;
        _referenceDataRepository = referenceDataRepository;
        _tourPhotoRepository = tourPhotoRepository;
        _tourScheduleRepository = tourScheduleRepository;
        _bookingRepository = bookingRepository;
    }

    public async Task<IReadOnlyCollection<TourSummaryDto>> GetListAsync(CancellationToken cancellationToken = default)
    {
        var tours = await _tourRepository.GetListAsync(cancellationToken);
        var tourIds = tours.Select(t => t.Id).ToArray();
        var photosByTour = await _tourPhotoRepository.GetPhotosByTourIdsAsync(tourIds, cancellationToken);

        return tours
            .Select(t => new TourSummaryDto(
                t.Id,
                t.Name,
                t.TourCategory.Name,
                photosByTour.TryGetValue(t.Id, out var ph) ? ph : Array.Empty<TourPhotoDto>()))
            .ToList();
    }

    public async Task<TourDetailDto?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tour = await _tourRepository.GetDetailAsync(id, cancellationToken);
        if (tour == null) return null;

        var schedules = await _tourScheduleRepository.GetByTourIdAsync(id, cancellationToken);
        var scheduleDtos = schedules
            .OrderBy(s => s.StartAtUtc)
            .Select(s => new TourScheduleDto(s.Id, s.StartAtUtc, s.EndAtUtc, s.Capacity))
            .ToList();

        var photos = await _tourPhotoRepository.GetPhotosByTourIdAsync(id, cancellationToken);

        return new TourDetailDto(
            tour.Id,
            tour.Name,
            tour.Description,
            tour.TourCategory.Name,
            scheduleDtos,
            photos);
    }

    public async Task<Guid> CreateAsync(CreateTourRequest request, Guid? currentUserId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var category = await _referenceDataRepository.GetOrCreateTourCategoryAsync(request.TourCategoryName, cancellationToken);

        var tour = new Tour
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description,
            TourCategoryId = category.Id,
            CreatedAtUtc = now,
            CreatedByUserId = currentUserId
        };

        await _tourRepository.CreateAsync(tour, cancellationToken);
        await _tourRepository.SaveChangesAsync(cancellationToken);

        await CommitAndLinkPhotosAsync(tour.Id, request.Photos, now, cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return tour.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateTourRequest request, Guid? currentUserId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var tour = await _tourRepository.GetForUpdateAsync(id, cancellationToken);
        if (tour == null) return false;

        var category = await _referenceDataRepository.GetOrCreateTourCategoryAsync(request.TourCategoryName, cancellationToken);

        tour.Name = request.Name.Trim();
        tour.Description = request.Description;
        tour.TourCategoryId = category.Id;
        tour.UpdatedAtUtc = now;
        tour.UpdatedByUserId = currentUserId;

        await _tourRepository.SaveChangesAsync(cancellationToken);

        await CommitAndLinkPhotosAsync(tour.Id, request.Photos, now, cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var tour = await _tourRepository.GetForUpdateAsync(id, cancellationToken);
        if (tour == null) return false;

        await _tourRepository.DeleteAsync(tour, cancellationToken);
        await _tourRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<Guid?> CreateScheduleAsync(Guid tourId, CreateTourScheduleRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Capacity <= 0) return null;
        if (request.EndAtUtc <= request.StartAtUtc) return null;

        var tour = await _tourRepository.GetForUpdateAsync(tourId, cancellationToken);
        if (tour == null) return null;

        var schedule = new TourSchedule
        {
            Id = Guid.NewGuid(),
            TourId = tourId,
            StartAtUtc = request.StartAtUtc,
            EndAtUtc = request.EndAtUtc,
            Capacity = request.Capacity,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _tourScheduleRepository.CreateAsync(schedule, cancellationToken);
        await _tourScheduleRepository.SaveChangesAsync(cancellationToken);
        return schedule.Id;
    }

    public async Task<bool> UpdateScheduleAsync(Guid scheduleId, UpdateTourScheduleRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Capacity <= 0) return false;
        if (request.EndAtUtc <= request.StartAtUtc) return false;

        var schedule = await _tourScheduleRepository.GetForUpdateAsync(scheduleId, cancellationToken);
        if (schedule == null) return false;

        schedule.StartAtUtc = request.StartAtUtc;
        schedule.EndAtUtc = request.EndAtUtc;
        schedule.Capacity = request.Capacity;

        await _tourScheduleRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default)
    {
        var schedule = await _tourScheduleRepository.GetForUpdateAsync(scheduleId, cancellationToken);
        if (schedule == null) return false;

        await _tourScheduleRepository.DeleteAsync(schedule, cancellationToken);
        await _tourScheduleRepository.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<BookTourResult> BookAsync(Guid tourId, Guid userId, CreateBookingRequest request, CancellationToken cancellationToken = default)
    {
        if (request.Seats <= 0)
        {
            return new BookTourResult(false, null, BookTourError.Invalid);
        }

        var tour = await _tourRepository.GetDetailAsync(tourId, cancellationToken);
        if (tour == null)
        {
            return new BookTourResult(false, null, BookTourError.NotFound);
        }

        var schedule = await _tourScheduleRepository.GetDetailAsync(request.TourScheduleId, cancellationToken);
        if (schedule == null || schedule.TourId != tourId)
        {
            return new BookTourResult(false, null, BookTourError.NotFound);
        }

        var alreadyBooked = await _bookingRepository.GetBookedSeatsAsync(schedule.Id, cancellationToken);
        if (alreadyBooked + request.Seats > schedule.Capacity)
        {
            return new BookTourResult(false, null, BookTourError.CapacityExceeded);
        }

        var booking = new Booking
        {
            Id = Guid.NewGuid(),
            TourId = tourId,
            TourScheduleId = schedule.Id,
            UserId = userId,
            Seats = request.Seats,
            CreatedAtUtc = DateTime.UtcNow
        };

        await _bookingRepository.CreateAsync(booking, cancellationToken);
        await _bookingRepository.SaveChangesAsync(cancellationToken);

        return new BookTourResult(true, booking.Id, null);
    }

    private async Task CommitAndLinkPhotosAsync(
        Guid tourId,
        IReadOnlyCollection<TourCommitPhotoItem>? photos,
        DateTime now,
        CancellationToken cancellationToken)
    {
        if (photos == null || photos.Count == 0) return;

        var commitItems = photos
            .Select(p => new CommitPhotoItem(p.StagedUploadId, p.Label, p.SortOrder, StagedUploadTargetType.Tour))
            .ToArray();

        var commitResults = await _photoCommitService.CommitAsync(commitItems, cancellationToken);

        foreach (var committed in commitResults)
        {
            var exists = await _tourPhotoRepository.LinkExistsAsync(tourId, committed.PhotoId, cancellationToken);
            if (exists) continue;

            _tourPhotoRepository.AddLink(new TourPhoto
            {
                TourId = tourId,
                PhotoId = committed.PhotoId,
                Label = committed.Label,
                SortOrder = committed.SortOrder,
                CreatedAtUtc = now
            });
        }

        await _tourPhotoRepository.SaveChangesAsync(cancellationToken);
    }
}
