using Server.SharedKernel.Repositories;

namespace Server.Modules.Exchange.Domain.Rates.Repositories;

public interface IExchangeRateRepository : IBaseRepository<ExchangeRateSnapshot>
{
    Task<IReadOnlyCollection<ExchangeRateSnapshot>> GetLatestAsync(CancellationToken cancellationToken = default);
    Task<ExchangeRateSnapshot?> GetLatestForPairAsync(Guid baseCurrencyId, Guid quoteCurrencyId, CancellationToken cancellationToken = default);
}
