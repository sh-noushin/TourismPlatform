using Server.Modules.Media.Domain;

namespace Server.Modules.Media.Contracts.Uploads;

public sealed record CommitPhotoItem(Guid StagedUploadId, string Label, int SortOrder, StagedUploadTargetType TargetType);
