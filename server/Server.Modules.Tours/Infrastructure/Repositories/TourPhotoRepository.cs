using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Domain.Photos;
using Server.Modules.Tours.Contracts.Tours.Dtos;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Domain.Tours.Repositories;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Tours.Infrastructure.Repositories;

public sealed class TourPhotoRepository : BaseRepository<TourPhoto>, ITourPhotoRepository
{
    public TourPhotoRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<IReadOnlyDictionary<Guid, IReadOnlyCollection<TourPhotoDto>>> GetPhotosByTourIdsAsync(
        IReadOnlyCollection<Guid> tourIds,
        CancellationToken cancellationToken = default)
    {
        if (tourIds.Count == 0)
        {
            return new Dictionary<Guid, IReadOnlyCollection<TourPhotoDto>>();
        }

        var rows = await (
                from tp in DbContext.Set<TourPhoto>().AsNoTracking()
                join p in DbContext.Set<Photo>().AsNoTracking() on tp.PhotoId equals p.Id
                where tourIds.Contains(tp.TourId)
                orderby tp.TourId, tp.SortOrder
                select new
                {
                    tp.TourId,
                    Photo = new TourPhotoDto(tp.PhotoId, tp.Label, tp.SortOrder, p.PermanentRelativePath)
                })
            .ToListAsync(cancellationToken);

        return rows
            .GroupBy(x => x.TourId)
            .ToDictionary(
                g => g.Key,
                g => (IReadOnlyCollection<TourPhotoDto>)g.Select(x => x.Photo).ToList());
    }

    public async Task<IReadOnlyCollection<TourPhotoDto>> GetPhotosByTourIdAsync(Guid tourId, CancellationToken cancellationToken = default)
    {
        return await (
                from tp in DbContext.Set<TourPhoto>().AsNoTracking()
                join p in DbContext.Set<Photo>().AsNoTracking() on tp.PhotoId equals p.Id
                where tp.TourId == tourId
                orderby tp.SortOrder
                select new TourPhotoDto(tp.PhotoId, tp.Label, tp.SortOrder, p.PermanentRelativePath))
            .ToListAsync(cancellationToken);
    }

    public Task<bool> LinkExistsAsync(Guid tourId, Guid photoId, CancellationToken cancellationToken = default)
    {
        return DbContext.Set<TourPhoto>()
            .AnyAsync(x => x.TourId == tourId && x.PhotoId == photoId, cancellationToken);
    }

    public void AddLink(TourPhoto link) => DbContext.Add(link);
}
