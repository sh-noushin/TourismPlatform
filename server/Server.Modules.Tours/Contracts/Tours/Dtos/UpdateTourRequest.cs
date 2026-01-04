namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record UpdateTourRequest(
    string Name,
    string? Description,
    string TourCategoryName,
    decimal Price,
    string Currency,
    string CountryCode,
    IReadOnlyCollection<TourCommitPhotoItem>? Photos = null,
    IReadOnlyCollection<TourScheduleUpdateItem>? Schedules = null,
    IReadOnlyCollection<Guid>? DeletedScheduleIds = null);
