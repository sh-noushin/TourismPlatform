using Microsoft.EntityFrameworkCore;
using Server.Modules.Properties.Domain.Countries;
using Server.Modules.Properties.Domain.Countries.Repositories;
using Server.SharedKernel.ReferenceData;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Properties.Infrastructure.Repositories;

public sealed class CountryRepository : BaseRepository<Country>, ICountryRepository
{
    public CountryRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<IReadOnlyCollection<Country>> GetListAsync(CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .OrderBy(x => x.Name)
            .ToListAsync(cancellationToken);
    }

    public Task<Country?> GetByCodeAsync(string code, CancellationToken cancellationToken = default)
    {
        var normalized = CountryCodes.Normalize(code);
        return Set.AsNoTracking().FirstOrDefaultAsync(x => x.Code == normalized, cancellationToken);
    }
}
