using Server.SharedKernel.Repositories;

namespace Server.Modules.Exchange.Domain.Rates.Repositories;

public interface IExchangeRateRepository : IBaseRepository<ExchangeRateSnapshot>
{
    Task<IReadOnlyCollection<ExchangeRateSnapshot>> GetLatestAsync(CancellationToken cancellationToken = default);
    Task<ExchangeRateSnapshot?> GetLatestForPairAsync(Guid baseCurrencyId, Guid quoteCurrencyId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Every snapshot captured at or after <paramref name="fromUtc"/>, oldest first.
    /// Grouping per pair happens in the service: one ordered read beats a query
    /// per pair, and the windows involved are small.
    /// </summary>
    Task<IReadOnlyCollection<ExchangeRateSnapshot>> GetSinceAsync(DateTime fromUtc, CancellationToken cancellationToken = default);
}
