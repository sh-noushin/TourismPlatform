using Microsoft.EntityFrameworkCore;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Domain.Houses.Repositories;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Properties.Infrastructure.Repositories;

public sealed class HouseRepository : BaseRepository<House>, IHouseRepository
{
    public HouseRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<IReadOnlyCollection<House>> GetListAsync(CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Include(h => h.HouseType)
            .Include(h => h.Address)
                .ThenInclude(a => a.Location)
            .OrderBy(h => h.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<House?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Include(h => h.HouseType)
            .Include(h => h.Address)
                .ThenInclude(a => a.Location)
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
    }

    public Task<House?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
        => Set.FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
}
