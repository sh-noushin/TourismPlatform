using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Server.Modules.Properties.Contracts.Houses.Dtos;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Properties.Domain.Houses.Repositories;

public interface IHousePhotoRepository : IBaseRepository<HousePhoto>
{
    Task<IReadOnlyDictionary<Guid, IReadOnlyCollection<HousePhotoDto>>> GetPhotosByHouseIdsAsync(
        IReadOnlyCollection<Guid> houseIds,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<HousePhotoDto>> GetPhotosByHouseIdAsync(Guid houseId, CancellationToken cancellationToken = default);

    Task<bool> LinkExistsAsync(Guid houseId, Guid photoId, CancellationToken cancellationToken = default);
    Task<bool> RemoveLinkAsync(Guid houseId, Guid photoId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<Guid>> GetPhotoIdsByHouseIdAsync(Guid houseId, CancellationToken cancellationToken = default);
    void AddLink(HousePhoto link);
}
