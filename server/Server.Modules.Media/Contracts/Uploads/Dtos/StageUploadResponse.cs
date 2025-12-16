using Server.Modules.Media.Domain.Uploads;

namespace Server.Modules.Media.Contracts.Uploads.Dtos;

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