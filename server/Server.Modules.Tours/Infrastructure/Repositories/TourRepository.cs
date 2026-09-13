using Microsoft.EntityFrameworkCore;
using Server.Modules.Tours.Domain.Tours;
using Server.Modules.Tours.Domain.Tours.Repositories;
using Server.SharedKernel.Paging;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Tours.Infrastructure.Repositories;

public sealed class TourRepository : BaseRepository<Tour>, ITourRepository
{
    public TourRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<IReadOnlyCollection<Tour>> GetListAsync(CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Include(t => t.TourCategory)
            .OrderBy(t => t.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyCollection<Tour> Items, int Total)> GetPagedAsync(
        PageQuery query,
        CancellationToken cancellationToken = default)
    {
        query = query.Normalized();

        IQueryable<Tour> filtered = Set
            .AsNoTracking()
            .Include(t => t.TourCategory);

        if (query.Search is { } search)
        {
            filtered = filtered.Where(t =>
                t.Name.Contains(search) ||
                t.TourCategory.Name.Contains(search));
        }

        var total = await filtered.CountAsync(cancellationToken);

        var (field, descending) = query.SortOrDefault("name");
        filtered = field.ToLowerInvariant() switch
        {
            "tourcategoryname" => descending
                ? filtered.OrderByDescending(t => t.TourCategory.Name)
                : filtered.OrderBy(t => t.TourCategory.Name),
            "price" => descending
                ? filtered.OrderByDescending(t => t.Price)
                : filtered.OrderBy(t => t.Price),
            "year" => descending
                ? filtered.OrderByDescending(t => t.CreatedAtUtc)
                : filtered.OrderBy(t => t.CreatedAtUtc),
            _ => descending
                ? filtered.OrderByDescending(t => t.Name)
                : filtered.OrderBy(t => t.Name)
        };

        filtered = ((IOrderedQueryable<Tour>)filtered).ThenBy(t => t.Id);

        var items = await filtered
            .Skip(query.Skip)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
    }

    public async Task<Tour?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await Set
            .AsNoTracking()
            .Include(t => t.TourCategory)
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
    }

    public Task<Tour?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
        => Set.FirstOrDefaultAsync(t => t.Id == id, cancellationToken);
}
