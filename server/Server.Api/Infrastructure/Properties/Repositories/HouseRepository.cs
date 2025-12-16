using Microsoft.EntityFrameworkCore;
using Server.Api.Infrastructure.Persistence;
using Server.Modules.Properties.Domain;
using Server.Modules.Properties.Domain.Repositories;

namespace Server.Api.Infrastructure.Properties.Repositories;

public sealed class HouseRepository : IHouseRepository
{
    private readonly ApplicationDbContext _dbContext;

    public HouseRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyCollection<House>> GetListAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<House>()
            .AsNoTracking()
            .Include(h => h.HouseType)
            .Include(h => h.Address)
                .ThenInclude(a => a.Location)
            .OrderBy(h => h.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<House?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<House>()
            .AsNoTracking()
            .Include(h => h.HouseType)
            .Include(h => h.Address)
                .ThenInclude(a => a.Location)
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
    }

    public async Task<House?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<House>()
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
    }

    public void Add(House house) => _dbContext.Add(house);

    public void Remove(House house) => _dbContext.Remove(house);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => _dbContext.SaveChangesAsync(cancellationToken);
}
