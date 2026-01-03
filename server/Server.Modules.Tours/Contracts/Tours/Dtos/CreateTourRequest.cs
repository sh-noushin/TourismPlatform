namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record CreateTourRequest(
    string Name,
    string? Description,
    string TourCategoryName,
    decimal Price,
    string Currency,
    IReadOnlyCollection<TourCommitPhotoItem>? Photos = null,
    IReadOnlyCollection<CreateTourScheduleRequest>? Schedules = null);
