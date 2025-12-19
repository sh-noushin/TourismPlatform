using Server.Modules.Media.Contracts.Uploads.Dtos;

namespace Server.Modules.Media.Application.Services;

public interface IStagedUploadService
{
    Task<StageUploadServiceResult> StageAsync(
        StageUploadRequest request,
        Guid? uploadedByUserId,
        CancellationToken cancellationToken = default);

    Task<StageUploadResponse?> GetAsync(Guid id, CancellationToken cancellationToken = default);
}

public sealed record StageUploadServiceResult(
    bool IsSuccess,
    StageUploadResponse? Response,
    string? ErrorMessage);
