namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record TourPhotoDto(Guid PhotoId, string Label, int SortOrder, string PermanentRelativePath);
