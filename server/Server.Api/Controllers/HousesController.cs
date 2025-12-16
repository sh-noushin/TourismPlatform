using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Api.Infrastructure.Media;
using Server.Api.Infrastructure.Persistence;
using Server.Modules.Media.Contracts.Uploads;
using Server.Modules.Media.Domain;
using Server.Modules.Properties.Contracts.Houses;
using Server.Modules.Properties.Domain;
using Server.SharedKernel.Auth;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/houses")]
public sealed class HousesController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IPhotoCommitService _photoCommitService;

    public HousesController(ApplicationDbContext dbContext, IPhotoCommitService photoCommitService)
    {
        _dbContext = dbContext;
        _photoCommitService = photoCommitService;
    }

    [HttpGet]
    public async Task<IActionResult> GetList(CancellationToken cancellationToken)
    {
        var houses = await _dbContext.Set<House>()
            .AsNoTracking()
            .Include(h => h.HouseType)
            .Include(h => h.Address)
                .ThenInclude(a => a.Location)
            .OrderBy(h => h.Name)
            .ToListAsync(cancellationToken);

        var houseIds = houses.Select(h => h.Id).ToArray();

        var photoRows = await (
            from hp in _dbContext.Set<HousePhoto>().AsNoTracking()
            join p in _dbContext.Set<Server.Modules.Media.Domain.Photo>().AsNoTracking() on hp.PhotoId equals p.Id
            where houseIds.Contains(hp.HouseId)
            orderby hp.HouseId, hp.SortOrder
            select new
            {
                hp.HouseId,
                Photo = new HousePhotoDto(hp.PhotoId, hp.Label, hp.SortOrder, p.PermanentRelativePath)
            })
            .ToListAsync(cancellationToken);

        var photosByHouse = photoRows
            .GroupBy(x => x.HouseId)
            .ToDictionary(g => g.Key, g => (IReadOnlyCollection<HousePhotoDto>)g.Select(x => x.Photo).ToList());

        var dto = houses.Select(h => new HouseSummaryDto(
                h.Id,
                h.Name,
                h.HouseType?.Name,
                h.Address?.Location?.City,
                h.Address?.Location?.Country,
                photosByHouse.TryGetValue(h.Id, out var ph) ? ph : Array.Empty<HousePhotoDto>()))
            .ToList();

        return Ok(dto);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetDetail(Guid id, CancellationToken cancellationToken)
    {
        var house = await _dbContext.Set<House>()
            .AsNoTracking()
            .Include(h => h.HouseType)
            .Include(h => h.Address)
                .ThenInclude(a => a.Location)
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);

        if (house == null) return NotFound();

        var photos = await (
            from hp in _dbContext.Set<HousePhoto>().AsNoTracking()
            join p in _dbContext.Set<Server.Modules.Media.Domain.Photo>().AsNoTracking() on hp.PhotoId equals p.Id
            where hp.HouseId == id
            orderby hp.SortOrder
            select new HousePhotoDto(hp.PhotoId, hp.Label, hp.SortOrder, p.PermanentRelativePath))
            .ToListAsync(cancellationToken);

        var dto = new HouseDetailDto(
            house.Id,
            house.Name,
            house.Description,
            house.HouseType?.Name,
            house.Address?.Line1,
            house.Address?.Line2,
            house.Address?.Location?.City,
            house.Address?.Location?.Region,
            house.Address?.Location?.Country,
            house.Address?.PostalCode,
            photos);

        return Ok(dto);
    }

    [HttpPost]
    [Authorize(PolicyNames.HousesManage)]
    public async Task<IActionResult> Create([FromBody] CreateHouseRequest request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var userId = GetCurrentUserId();

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var houseType = await GetOrCreateHouseTypeAsync(request.HouseTypeName, cancellationToken);
        var location = await GetOrCreateLocationAsync(request.Address, cancellationToken);
        var address = await GetOrCreateAddressAsync(location.Id, request.Address, cancellationToken);

        var house = new House
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description,
            HouseTypeId = houseType.Id,
            AddressId = address.Id,
            CreatedAtUtc = now,
            CreatedByUserId = userId
        };

        _dbContext.Add(house);
        await _dbContext.SaveChangesAsync(cancellationToken);

        if (request.Photos != null && request.Photos.Count > 0)
        {
            var commitItems = request.Photos
                .Select(p => new CommitPhotoItem(p.StagedUploadId, p.Label, p.SortOrder, StagedUploadTargetType.House))
                .ToArray();

            var commitResults = await _photoCommitService.CommitAsync(commitItems, cancellationToken);

            foreach (var committed in commitResults)
            {
                _dbContext.Add(new HousePhoto
                {
                    HouseId = house.Id,
                    PhotoId = committed.PhotoId,
                    Label = committed.Label,
                    SortOrder = committed.SortOrder,
                    CreatedAtUtc = now
                });
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return CreatedAtAction(nameof(GetDetail), new { id = house.Id }, new { houseId = house.Id });
    }

    [HttpPut("{id:guid}")]
    [Authorize(PolicyNames.HousesManage)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateHouseRequest request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var userId = GetCurrentUserId();

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var house = await _dbContext.Set<House>()
            .FirstOrDefaultAsync(h => h.Id == id, cancellationToken);

        if (house == null) return NotFound();

        var houseType = await GetOrCreateHouseTypeAsync(request.HouseTypeName, cancellationToken);
        var location = await GetOrCreateLocationAsync(request.Address, cancellationToken);
        var address = await GetOrCreateAddressAsync(location.Id, request.Address, cancellationToken);

        house.Name = request.Name.Trim();
        house.Description = request.Description;
        house.HouseTypeId = houseType.Id;
        house.AddressId = address.Id;
        house.UpdatedAtUtc = now;
        house.UpdatedByUserId = userId;

        await _dbContext.SaveChangesAsync(cancellationToken);

        if (request.Photos != null && request.Photos.Count > 0)
        {
            var commitItems = request.Photos
                .Select(p => new CommitPhotoItem(p.StagedUploadId, p.Label, p.SortOrder, StagedUploadTargetType.House))
                .ToArray();

            var commitResults = await _photoCommitService.CommitAsync(commitItems, cancellationToken);

            foreach (var committed in commitResults)
            {
                var exists = await _dbContext.Set<HousePhoto>()
                    .AnyAsync(x => x.HouseId == house.Id && x.PhotoId == committed.PhotoId, cancellationToken);

                if (exists) continue;

                _dbContext.Add(new HousePhoto
                {
                    HouseId = house.Id,
                    PhotoId = committed.PhotoId,
                    Label = committed.Label,
                    SortOrder = committed.SortOrder,
                    CreatedAtUtc = now
                });
            }
        }

        await _dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(PolicyNames.HousesManage)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var house = await _dbContext.Set<House>().FirstOrDefaultAsync(h => h.Id == id, cancellationToken);
        if (house == null) return NotFound();

        _dbContext.Remove(house);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return NoContent();
    }

    private async Task<HouseType> GetOrCreateHouseTypeAsync(string houseTypeName, CancellationToken cancellationToken)
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

    private async Task<Location> GetOrCreateLocationAsync(AddressRequest request, CancellationToken cancellationToken)
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

    private async Task<Address> GetOrCreateAddressAsync(Guid locationId, AddressRequest request, CancellationToken cancellationToken)
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

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        return Guid.TryParse(claim, out var userId) ? userId : null;
    }
}
