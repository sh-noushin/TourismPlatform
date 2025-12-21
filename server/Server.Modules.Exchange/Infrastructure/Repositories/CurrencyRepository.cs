using Microsoft.EntityFrameworkCore;
using Server.Modules.Exchange.Domain.Currencies;
using Server.Modules.Exchange.Domain.Currencies.Repositories;
using Server.SharedKernel.ReferenceData;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Exchange.Infrastructure.Repositories;

public sealed class CurrencyRepository : BaseRepository<Currency>, ICurrencyRepository
{
    public CurrencyRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<IReadOnlyCollection<Currency>> GetListAsync(CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .OrderBy(x => x.Code)
            .ToListAsync(cancellationToken);
    }

    public Task<Currency?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalized = CurrencyCodes.Normalize(code);
        if (!CurrencyCodes.Contains(normalized))
        {
            return Task.FromResult<Currency?>(null);
        }
        return Set.AsNoTracking().FirstOrDefaultAsync(x => x.Code == normalized, cancellationToken);
    }

    public async Task<IReadOnlyDictionary<string, Currency>> GetByCodesAsync(IEnumerable<string> codes, CancellationToken cancellationToken = default)
    {
        var normalizedCodes = codes
            .Where(c => !string.IsNullOrWhiteSpace(c))
            .Select(CurrencyCodes.Normalize)
            .Distinct()
            .ToArray();

        var currencies = await Set
            .AsNoTracking()
            .Where(c => normalizedCodes.Contains(c.Code))
            .ToListAsync(cancellationToken);

        return currencies.ToDictionary(c => c.Code, c => c, StringComparer.OrdinalIgnoreCase);
    }
}
