using Server.SharedKernel.Repositories;
using Server.Modules.Properties.Domain.Houses;

namespace Server.Modules.Properties.Domain.Houses.Repositories;

public interface IHouseRepository : IBaseRepository<House>
{
    Task<IReadOnlyCollection<House>> GetListAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<House>> GetListAsync(HouseListingType? listingType, CancellationToken cancellationToken = default);
    Task<House?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default);
    Task<House?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
}
