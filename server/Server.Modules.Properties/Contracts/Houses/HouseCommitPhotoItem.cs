namespace Server.Modules.Properties.Contracts.Houses;

public sealed record HouseCommitPhotoItem(Guid StagedUploadId, string Label, int SortOrder);
