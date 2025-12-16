using Server.Modules.Media.Contracts.Uploads;

namespace Server.Api.Infrastructure.Media;

public interface IPhotoCommitService
{
    Task<IReadOnlyCollection<PhotoCommitResult>> CommitAsync(
        IReadOnlyCollection<CommitPhotoItem> items,
        CancellationToken cancellationToken = default);
}
