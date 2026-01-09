using Microsoft.EntityFrameworkCore;
using Server.Modules.PublicWeb.Domain;
using Server.SharedKernel.Repositories;

namespace Server.Modules.PublicWeb.Infrastructure.Repositories;

public sealed class PublicLearnMorePageRepository : BaseRepository<PublicLearnMorePage>, IPublicLearnMorePageRepository
{
    public PublicLearnMorePageRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<PublicLearnMorePage?> GetByLocaleAsync(string locale, CancellationToken cancellationToken = default)
    {
        return await Query()
            .FirstOrDefaultAsync(p => p.Locale == locale, cancellationToken);
    }
}
