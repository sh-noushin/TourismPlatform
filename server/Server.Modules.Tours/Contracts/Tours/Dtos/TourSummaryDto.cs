namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record TourSummaryDto(
    Guid TourId,
    string Name,
    string? Description,
    string TourCategoryName,
    string? NameEn,
    string? DescriptionEn,
    string? TourCategoryNameEn,
    decimal Price,
    string Currency,
    int Year,
    IReadOnlyCollection<TourPhotoDto> Photos);
