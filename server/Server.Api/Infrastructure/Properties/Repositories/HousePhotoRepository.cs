using Microsoft.EntityFrameworkCore;
using Server.Api.Infrastructure.Persistence;
using Server.Modules.Properties.Contracts.Houses;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Domain.Houses.Repositories;

namespace Server.Api.Infrastructure.Properties.Repositories;

public sealed class HousePhotoRepository : IHousePhotoRepository
{
    private readonly ApplicationDbContext _dbContext;

    public HousePhotoRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IReadOnlyDictionary<Guid, IReadOnlyCollection<HousePhotoDto>>> GetPhotosByHouseIdsAsync(
        IReadOnlyCollection<Guid> houseIds,
        CancellationToken cancellationToken = default)
    {
        if (houseIds.Count == 0)
        {
            return new Dictionary<Guid, IReadOnlyCollection<HousePhotoDto>>();
        }

        var rows = await (
                from hp in _dbContext.Set<HousePhoto>().AsNoTracking()
                join p in _dbContext.Set<Server.Modules.Media.Domain.Photo>().AsNoTracking()
                    on hp.PhotoId equals p.Id
                where houseIds.Contains(hp.HouseId)
                orderby hp.HouseId, hp.SortOrder
                select new
                {
                    hp.HouseId,
                    Photo = new HousePhotoDto(hp.PhotoId, hp.Label, hp.SortOrder, p.PermanentRelativePath)
                })
            .ToListAsync(cancellationToken);

        return rows
            .GroupBy(x => x.HouseId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyCollection<HousePhotoDto>)g.Select(x => x.Photo).ToList());
    }

    public async Task<IReadOnlyCollection<HousePhotoDto>> GetPhotosByHouseIdAsync(Guid houseId, CancellationToken cancellationToken = default)
    {
        return await (
                from hp in _dbContext.Set<HousePhoto>().AsNoTracking()
                join p in _dbContext.Set<Server.Modules.Media.Domain.Photo>().AsNoTracking()
                    on hp.PhotoId equals p.Id
                where hp.HouseId == houseId
                orderby hp.SortOrder
                select new HousePhotoDto(hp.PhotoId, hp.Label, hp.SortOrder, p.PermanentRelativePath))
            .ToListAsync(cancellationToken);
    }

    public Task<bool> LinkExistsAsync(Guid houseId, Guid photoId, CancellationToken cancellationToken = default)
    {
        return _dbContext.Set<HousePhoto>()
            .AnyAsync(x => x.HouseId == houseId && x.PhotoId == photoId, cancellationToken);
    }

    public void AddLink(HousePhoto link) => _dbContext.Add(link);

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => _dbContext.SaveChangesAsync(cancellationToken);
}
