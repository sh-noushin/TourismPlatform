namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record TourDetailDto(
    Guid TourId,
    string Name,
    string? Description,
    string TourCategoryName,
    decimal Price,
    string Currency,
    IReadOnlyCollection<TourScheduleDto> Schedules,
    IReadOnlyCollection<TourPhotoDto> Photos);
