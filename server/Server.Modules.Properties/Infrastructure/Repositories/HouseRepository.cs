using Microsoft.EntityFrameworkCore;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Domain.Houses.Repositories;
using Server.SharedKernel.Paging;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Properties.Infrastructure.Repositories;

public sealed class HouseRepository : BaseRepository<House>, IHouseRepository
{
    public HouseRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public async Task<IReadOnlyCollection<House>> GetListAsync(CancellationToken cancellationToken = default)
        => await GetListAsync(listingType: null, cancellationToken);

    public async Task<IReadOnlyCollection<House>> GetListAsync(HouseListingType? listingType, CancellationToken cancellationToken = default)
    {
        IQueryable<House> query = Set
            .AsNoTracking()
            .Include(h => h.HouseType)
            .Include(h => h.Address)
            .ThenInclude(a => a.Location);

        if (listingType is not null)
        {
            query = query.Where(h => h.ListingType == listingType);
        }

        return await query
            .OrderBy(h => h.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<(IReadOnlyCollection<House> Items, int Total)> GetPagedAsync(
        HouseListingType? listingType,
        PageQuery query,
        CancellationToken cancellationToken = default)
    {
        query = query.Normalized();

        IQueryable<House> filtered = Set
            .AsNoTracking()
            .Include(h => h.HouseType)
            .Include(h => h.Address)
            .ThenInclude(a => a.Location);

        if (listingType is not null)
        {
            filtered = filtered.Where(h => h.ListingType == listingType);
        }

        if (query.Search is { } search)
        {
            // The same fields the table shows, so a search that finds nothing
            // visibly explains itself.
            filtered = filtered.Where(h =>
                h.Name.Contains(search) ||
                h.HouseType.Name.Contains(search) ||
                h.Address.Location.City.Contains(search) ||
                h.Address.Location.Country.Contains(search));
        }

        // Counted before paging, and after filtering: this is the pager's total.
        var total = await filtered.CountAsync(cancellationToken);

        var (field, descending) = query.SortOrDefault("name");
        filtered = field.ToLowerInvariant() switch
        {
            "housetypename" => descending
                ? filtered.OrderByDescending(h => h.HouseType.Name)
                : filtered.OrderBy(h => h.HouseType.Name),
            "city" => descending
                ? filtered.OrderByDescending(h => h.Address.Location.City)
                : filtered.OrderBy(h => h.Address.Location.City),
            "country" => descending
                ? filtered.OrderByDescending(h => h.Address.Location.Country)
                : filtered.OrderBy(h => h.Address.Location.Country),
            "price" => descending
                ? filtered.OrderByDescending(h => h.Price)
                : filtered.OrderBy(h => h.Price),
            _ => descending
                ? filtered.OrderByDescending(h => h.Name)
                : filtered.OrderBy(h => h.Name)
        };

        // Name breaks ties: without a total order SQL Server may hand back the
        // same row on two different pages.
        filtered = ((IOrderedQueryable<House>)filtered).ThenBy(h => h.Id);

        var items = await filtered
            .Skip(query.Skip)
            .Take(query.PageSize)
            .ToListAsync(cancellationToken);

        return (items, total);
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
