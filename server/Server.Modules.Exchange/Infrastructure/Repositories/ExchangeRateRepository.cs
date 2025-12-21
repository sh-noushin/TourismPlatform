using Microsoft.EntityFrameworkCore;
using Server.Modules.Exchange.Domain.Rates;
using Server.Modules.Exchange.Domain.Rates.Repositories;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Exchange.Infrastructure.Repositories;

public sealed class ExchangeRateRepository : BaseRepository<ExchangeRateSnapshot>, IExchangeRateRepository
{
    public ExchangeRateRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<IReadOnlyCollection<ExchangeRateSnapshot>> GetLatestAsync(CancellationToken cancellationToken = default)
    {
        // For each currency pair, return the most recent snapshot.
        // Keep this query provider-friendly (notably SQLite) by avoiding GroupBy + First + Include.
        return await Set
            .AsNoTracking()
            .Where(s => s.CapturedAtUtc == Set
                .Where(s2 => s2.BaseCurrencyId == s.BaseCurrencyId && s2.QuoteCurrencyId == s.QuoteCurrencyId)
                .Max(s2 => s2.CapturedAtUtc))
            .Include(x => x.BaseCurrency)
            .Include(x => x.QuoteCurrency)
            .OrderBy(x => x.BaseCurrency.Code)
            .ThenBy(x => x.QuoteCurrency.Code)
            .ToListAsync(cancellationToken);
    }

    public Task<ExchangeRateSnapshot?> GetLatestForPairAsync(Guid baseCurrencyId, Guid quoteCurrencyId, CancellationToken cancellationToken = default)
    {
        return Set
            .AsNoTracking()
            .Where(x => x.BaseCurrencyId == baseCurrencyId && x.QuoteCurrencyId == quoteCurrencyId)
            .OrderByDescending(x => x.CapturedAtUtc)
            .FirstOrDefaultAsync(cancellationToken);
    }
}
