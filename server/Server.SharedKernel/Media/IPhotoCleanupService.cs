using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Server.SharedKernel.Media;

public interface IPhotoCleanupService
{
    Task<IReadOnlyCollection<Guid>> CleanupOrphanedPhotosAsync(
        IReadOnlyCollection<Guid> photoIds,
        CancellationToken cancellationToken = default);
}
