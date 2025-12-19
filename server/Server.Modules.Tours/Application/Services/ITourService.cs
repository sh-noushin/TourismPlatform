using Server.Modules.Tours.Contracts.Tours.Dtos;

namespace Server.Modules.Tours.Application.Services;

public interface ITourService
{
    Task<IReadOnlyCollection<TourSummaryDto>> GetListAsync(CancellationToken cancellationToken = default);
    Task<TourDetailDto?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Guid> CreateAsync(CreateTourRequest request, Guid? currentUserId, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Guid id, UpdateTourRequest request, Guid? currentUserId, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> UnlinkPhotoAsync(Guid tourId, Guid photoId, CancellationToken cancellationToken = default);

    Task<Guid?> CreateScheduleAsync(Guid tourId, CreateTourScheduleRequest request, CancellationToken cancellationToken = default);
    Task<bool> UpdateScheduleAsync(Guid scheduleId, UpdateTourScheduleRequest request, CancellationToken cancellationToken = default);
    Task<bool> DeleteScheduleAsync(Guid scheduleId, CancellationToken cancellationToken = default);

    Task<BookTourResult> BookAsync(Guid tourId, Guid userId, CreateBookingRequest request, CancellationToken cancellationToken = default);
}

public sealed record BookTourResult(
    bool IsSuccess,
    Guid? BookingId,
    BookTourError? Error);

public enum BookTourError
{
    NotFound = 0,
    Invalid = 1,
    CapacityExceeded = 2
}
