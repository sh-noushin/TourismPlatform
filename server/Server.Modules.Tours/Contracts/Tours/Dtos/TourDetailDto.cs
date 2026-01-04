namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record TourDetailDto(
    Guid TourId,
    string Name,
    string? Description,
    string TourCategoryName,
    decimal Price,
    string Currency,
    string CountryCode,
    IReadOnlyCollection<TourScheduleDto> Schedules,
    IReadOnlyCollection<TourPhotoDto> Photos);
