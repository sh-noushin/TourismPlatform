using Microsoft.EntityFrameworkCore;
using Server.Modules.PublicWeb.Domain;
using Server.SharedKernel.Repositories;
using System.Linq;

namespace Server.Modules.PublicWeb.Infrastructure.Repositories;

public sealed class PublicCallToActionRepository : BaseRepository<PublicCallToAction>, IPublicCallToActionRepository
{
    public PublicCallToActionRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<PublicCallToAction?> GetAsync(string locale, string actionId, CancellationToken cancellationToken = default)
    {
        return await Query()
            .FirstOrDefaultAsync(a => a.Locale == locale && a.Id == actionId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<PublicCallToAction>> ListByLocaleAsync(string locale, CancellationToken cancellationToken = default)
    {
        return await Query()
            .Where(a => a.Locale == locale && a.IsActive)
            .OrderBy(a => a.SortOrder)
            .ToListAsync(cancellationToken);
    }
}
