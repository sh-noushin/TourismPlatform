using Server.SharedKernel.Paging;
using Server.SharedKernel.Repositories;
using Server.Modules.Properties.Domain.Houses;

namespace Server.Modules.Properties.Domain.Houses.Repositories;

public interface IHouseRepository : IBaseRepository<House>
{
    Task<IReadOnlyCollection<House>> GetListAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<House>> GetListAsync(HouseListingType? listingType, CancellationToken cancellationToken = default);
    /// <summary>
    /// One page of houses, ordered and filtered in the database. The count is
    /// taken from the same filtered query so the pager matches what is shown.
    /// </summary>
    Task<(IReadOnlyCollection<House> Items, int Total)> GetPagedAsync(
        HouseListingType? listingType,
        PageQuery query,
        CancellationToken cancellationToken = default);

    Task<House?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default);
    Task<House?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
}
