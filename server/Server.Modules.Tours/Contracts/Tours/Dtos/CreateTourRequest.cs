namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record CreateTourRequest(
    string Name,
    string? Description,
    string TourCategoryName,
    IReadOnlyCollection<TourCommitPhotoItem>? Photos);
