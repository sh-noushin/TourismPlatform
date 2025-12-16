using Server.Modules.Media.Contracts.Uploads.Dtos;

namespace Server.Modules.Media.Application.Services;

public interface IPhotoCommitService
{
    Task<IReadOnlyCollection<PhotoCommitResult>> CommitAsync(
        IReadOnlyCollection<CommitPhotoItem> items,
        CancellationToken cancellationToken = default);
}
