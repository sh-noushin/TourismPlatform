using Microsoft.EntityFrameworkCore;
using Server.Modules.PublicWeb.Domain;
using Server.SharedKernel.Repositories;

namespace Server.Modules.PublicWeb.Infrastructure.Repositories;

public sealed class PublicContactInfoRepository : BaseRepository<PublicContactInfo>, IPublicContactInfoRepository
{
    public PublicContactInfoRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<PublicContactInfo?> GetByLocaleAsync(string locale, CancellationToken cancellationToken = default)
    {
        return await Query()
            .FirstOrDefaultAsync(c => c.Locale == locale, cancellationToken);
    }
}
