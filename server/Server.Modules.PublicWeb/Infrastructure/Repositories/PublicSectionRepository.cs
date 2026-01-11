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

    public async Task<PublicSection?> GetAsync(string sectionId, CancellationToken cancellationToken = default)
    {
        return await Query()
            .FirstOrDefaultAsync(s => s.Id == sectionId, cancellationToken);
    }

    public async Task<IReadOnlyCollection<PublicSection>> ListAsync(CancellationToken cancellationToken = default)
    {
        return await Query()
            .OrderBy(s => s.SectionType)
            .ToListAsync(cancellationToken);
    }
}
