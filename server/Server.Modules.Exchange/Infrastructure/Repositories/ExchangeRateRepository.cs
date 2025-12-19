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
        return await Set
            .AsNoTracking()
            .Include(x => x.BaseCurrency)
            .Include(x => x.QuoteCurrency)
            .GroupBy(x => new { x.BaseCurrencyId, x.QuoteCurrencyId })
            .Select(g => g.OrderByDescending(x => x.CapturedAtUtc).First())
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
