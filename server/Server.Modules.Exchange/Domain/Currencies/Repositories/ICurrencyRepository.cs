using Server.SharedKernel.Repositories;

namespace Server.Modules.Exchange.Domain.Currencies.Repositories;

public interface ICurrencyRepository : IBaseRepository<Currency>
{
    Task<IReadOnlyCollection<Currency>> GetListAsync(CancellationToken cancellationToken = default);
    Task<Currency?> GetByCodeAsync(string code, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<string, Currency>> GetByCodesAsync(IEnumerable<string> codes, CancellationToken cancellationToken = default);
}
