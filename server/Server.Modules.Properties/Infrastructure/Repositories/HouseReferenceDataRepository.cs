using Microsoft.EntityFrameworkCore;
using Server.Modules.Properties.Contracts.Houses.Dtos;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Domain.Houses.Repositories;

namespace Server.Modules.Properties.Infrastructure.Repositories;

public sealed class HouseReferenceDataRepository : IHouseReferenceDataRepository
{
    private readonly DbContext _dbContext;

    public HouseReferenceDataRepository(DbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HouseType> GetOrCreateHouseTypeAsync(string houseTypeName, CancellationToken cancellationToken = default)
    {
        var normalized = houseTypeName.Trim();

        var existing = await _dbContext.Set<HouseType>()
            .FirstOrDefaultAsync(x => x.Name == normalized, cancellationToken);

        if (existing != null) return existing;

        var created = new HouseType { Id = Guid.NewGuid(), Name = normalized };
        _dbContext.Add(created);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return created;
    }

    public async Task<Location> GetOrCreateLocationAsync(AddressRequest request, CancellationToken cancellationToken = default)
    {
        var country = request.Country.Trim();
        var city = request.City.Trim();
        var region = string.IsNullOrWhiteSpace(request.Region) ? null : request.Region.Trim();

        var existing = await _dbContext.Set<Location>()
            .FirstOrDefaultAsync(x => x.Country == country && x.City == city && x.Region == region, cancellationToken);

        if (existing != null) return existing;

        var created = new Location { Id = Guid.NewGuid(), Country = country, City = city, Region = region };
        _dbContext.Add(created);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return created;
    }

    public async Task<Address> GetOrCreateAddressAsync(Guid locationId, AddressRequest request, CancellationToken cancellationToken = default)
    {
        var line1 = request.Line1.Trim();
        var line2 = string.IsNullOrWhiteSpace(request.Line2) ? null : request.Line2.Trim();
        var postal = string.IsNullOrWhiteSpace(request.PostalCode) ? null : request.PostalCode.Trim();

        var existing = await _dbContext.Set<Address>()
            .FirstOrDefaultAsync(
                x => x.LocationId == locationId
                    && x.Line1 == line1
                    && x.Line2 == line2
                    && x.PostalCode == postal,
                cancellationToken);

        if (existing != null) return existing;

        var created = new Address
        {
            Id = Guid.NewGuid(),
            LocationId = locationId,
            Line1 = line1,
            Line2 = line2,
            PostalCode = postal
        };

        _dbContext.Add(created);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return created;
    }
}
