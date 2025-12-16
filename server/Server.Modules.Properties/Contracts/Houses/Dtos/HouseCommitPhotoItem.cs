namespace Server.Modules.Properties.Contracts.Houses.Dtos;

public sealed record HouseCommitPhotoItem(Guid StagedUploadId, string Label, int SortOrder);