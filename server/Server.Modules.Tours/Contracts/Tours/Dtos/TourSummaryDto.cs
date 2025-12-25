namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record TourSummaryDto(
    Guid TourId,
    string Name,
    string? Description,
    string TourCategoryName,
    int Year,
    IReadOnlyCollection<TourPhotoDto> Photos);
