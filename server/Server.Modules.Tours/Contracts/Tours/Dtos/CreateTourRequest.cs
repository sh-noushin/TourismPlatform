namespace Server.Modules.Tours.Contracts.Tours.Dtos;

// English text sits at the end with defaults on purpose: it is optional, and a
// caller that has no translation should not have to name it.
public sealed record CreateTourRequest(
    string Name,
    string? Description,
    string TourCategoryName,
    decimal Price,
    string Currency,
    string CountryCode,
    IReadOnlyCollection<TourCommitPhotoItem>? Photos = null,
    IReadOnlyCollection<CreateTourScheduleRequest>? Schedules = null,
    string? NameEn = null,
    string? DescriptionEn = null);
