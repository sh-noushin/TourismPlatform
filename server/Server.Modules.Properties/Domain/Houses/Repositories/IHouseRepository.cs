using Server.SharedKernel.Repositories;

namespace Server.Modules.Properties.Domain.Houses.Repositories;

public interface IHouseRepository : IBaseRepository<House>
{
    Task<IReadOnlyCollection<House>> GetListAsync(CancellationToken cancellationToken = default);
    Task<House?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default);
    Task<House?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
}
