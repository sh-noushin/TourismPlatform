namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record TourCommitPhotoItem(Guid StagedUploadId, string Label, int SortOrder);
