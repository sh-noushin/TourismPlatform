using Server.Modules.Tours.Contracts.Tours.Dtos;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Tours.Domain.Tours.Repositories;

public interface ITourPhotoRepository : IBaseRepository<TourPhoto>
{
    Task<IReadOnlyDictionary<Guid, IReadOnlyCollection<TourPhotoDto>>> GetPhotosByTourIdsAsync(
        IReadOnlyCollection<Guid> tourIds,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<TourPhotoDto>> GetPhotosByTourIdAsync(Guid tourId, CancellationToken cancellationToken = default);

    Task<bool> LinkExistsAsync(Guid tourId, Guid photoId, CancellationToken cancellationToken = default);
    Task<bool> RemoveLinkAsync(Guid tourId, Guid photoId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Guid>> GetPhotoIdsByTourIdAsync(Guid tourId, CancellationToken cancellationToken = default);

    void AddLink(TourPhoto link);
}
