using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Properties.Contracts.Houses.Dtos;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Domain.Houses.Repositories;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Properties.Infrastructure.Repositories;

public sealed class HousePhotoRepository : BaseRepository<HousePhoto>, IHousePhotoRepository
{
    public HousePhotoRepository(DbContext dbContext)
        : base(dbContext)
    {
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
                from hp in DbContext.Set<HousePhoto>().AsNoTracking()
                join p in DbContext.Set<Photo>().AsNoTracking() on hp.PhotoId equals p.Id
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
                from hp in DbContext.Set<HousePhoto>().AsNoTracking()
                join p in DbContext.Set<Photo>().AsNoTracking() on hp.PhotoId equals p.Id
                where hp.HouseId == houseId
                orderby hp.SortOrder
                select new HousePhotoDto(hp.PhotoId, hp.Label, hp.SortOrder, p.PermanentRelativePath))
            .ToListAsync(cancellationToken);
    }

    public Task<bool> LinkExistsAsync(Guid houseId, Guid photoId, CancellationToken cancellationToken = default)
    {
        return DbContext.Set<HousePhoto>()
            .AnyAsync(x => x.HouseId == houseId && x.PhotoId == photoId, cancellationToken);
    }

    public void AddLink(HousePhoto link) => DbContext.Add(link);

    public async Task<bool> RemoveLinkAsync(Guid houseId, Guid photoId, CancellationToken cancellationToken = default)
    {
        var link = await DbContext.Set<HousePhoto>().FindAsync(new object[] { houseId, photoId }, cancellationToken);
        if (link == null)
        {
            return false;
        }

        DbContext.Remove(link);
        return true;
    }

    public async Task<IReadOnlyCollection<Guid>> GetPhotoIdsByHouseIdAsync(Guid houseId, CancellationToken cancellationToken = default)
    {
        return await DbContext.Set<HousePhoto>()
            .Where(x => x.HouseId == houseId)
            .Select(x => x.PhotoId)
            .ToListAsync(cancellationToken);
    }
}
