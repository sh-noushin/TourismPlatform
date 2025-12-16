using Server.Modules.Media.Domain.Uploads;

namespace Server.Modules.Media.Contracts.Uploads;

public sealed record CommitPhotoItem(Guid StagedUploadId, string Label, int SortOrder, StagedUploadTargetType TargetType);
