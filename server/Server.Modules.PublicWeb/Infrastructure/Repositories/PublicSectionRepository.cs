using Microsoft.EntityFrameworkCore;
using Server.Modules.PublicWeb.Domain;
using Server.SharedKernel.Repositories;
using System.Linq;

namespace Server.Modules.PublicWeb.Infrastructure.Repositories;

public sealed class PublicSectionRepository : BaseRepository<PublicSection>, IPublicSectionRepository
{
    public PublicSectionRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<PublicSection?> GetAsync(string locale, string sectionId, CancellationToken cancellationToken = default)
    {
        return await Query()
            .FirstOrDefaultAsync(s => s.Locale == locale && s.Id == sectionId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<PublicSection>> ListByLocaleAsync(string locale, CancellationToken cancellationToken = default)
    {
        return await Query()
            .Where(s => s.Locale == locale && s.IsActive)
            .OrderBy(s => s.SortOrder)
            .ToListAsync(cancellationToken);
    }
}
