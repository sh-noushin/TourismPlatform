using Server.Modules.Media.Domain.Uploads;

namespace Server.Modules.Media.Contracts.Uploads;

public sealed record PhotoCommitResult(Guid PhotoId, string Label, int SortOrder, string PermanentRelativePath, StagedUploadTargetType TargetType);
