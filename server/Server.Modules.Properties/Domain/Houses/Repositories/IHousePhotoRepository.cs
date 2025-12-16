using Server.Modules.Properties.Contracts.Houses;

namespace Server.Modules.Properties.Domain.Houses.Repositories;

public interface IHousePhotoRepository
{
    Task<IReadOnlyDictionary<Guid, IReadOnlyCollection<HousePhotoDto>>> GetPhotosByHouseIdsAsync(
        IReadOnlyCollection<Guid> houseIds,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyCollection<HousePhotoDto>> GetPhotosByHouseIdAsync(Guid houseId, CancellationToken cancellationToken = default);

    Task<bool> LinkExistsAsync(Guid houseId, Guid photoId, CancellationToken cancellationToken = default);
    void AddLink(HousePhoto link);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
