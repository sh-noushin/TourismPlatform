using Server.SharedKernel.Paging;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Tours.Domain.Tours.Repositories;

public interface ITourRepository : IBaseRepository<Tour>
{
    Task<IReadOnlyCollection<Tour>> GetListAsync(CancellationToken cancellationToken = default);
    Task<(IReadOnlyCollection<Tour> Items, int Total)> GetPagedAsync(
        PageQuery query,
        CancellationToken cancellationToken = default);

    Task<Tour?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Tour?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
}
