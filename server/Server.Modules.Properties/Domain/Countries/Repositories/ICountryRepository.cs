using Server.SharedKernel.Repositories;

namespace Server.Modules.Properties.Domain.Countries.Repositories;

public interface ICountryRepository : IBaseRepository<Country>
{
    Task<IReadOnlyCollection<Country>> GetListAsync(CancellationToken cancellationToken = default);
    Task<Country?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
}
