namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record TourSummaryDto(
    Guid TourId,
    string Name,
    string TourCategoryName,
    IReadOnlyCollection<TourPhotoDto> Photos);
