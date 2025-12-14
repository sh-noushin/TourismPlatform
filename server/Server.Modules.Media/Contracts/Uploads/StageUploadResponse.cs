using Server.Modules.Media.Domain;

namespace Server.Modules.Media.Contracts.Uploads;

public sealed record StageUploadResponse(
    Guid StagedUploadId,
    string TempRelativePath,
    string UuidFileName,
    string Extension,
    string ContentType,
    long FileSize,
    DateTime CreatedAtUtc,
    DateTime ExpiresAtUtc,
    StagedUploadTargetType TargetType);
