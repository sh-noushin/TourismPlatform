using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Media.Application.Services;
using Server.Modules.Media.Contracts.Uploads.Dtos;
using Server.Modules.Media.Domain.Uploads;
using Server.Modules.Properties.Application.Services;
using Server.Modules.Properties.Contracts.Houses.Dtos;
using Server.Modules.Properties.Domain.Houses;
using Server.Modules.Properties.Domain.Houses.Repositories;
using Server.SharedKernel.Media;

namespace Server.Modules.Properties.Contracts.Houses.Services;

public sealed class HouseService : IHouseService
{
    private readonly DbContext _dbContext;
    private readonly IPhotoCommitService _photoCommitService;
    private readonly IPhotoCleanupService _photoCleanupService;
    private readonly IHouseRepository _houseRepository;
    private readonly IHouseReferenceDataRepository _referenceDataRepository;
    private readonly IHousePhotoRepository _housePhotoRepository;

    public HouseService(
        DbContext dbContext,
        IPhotoCommitService photoCommitService,
        IPhotoCleanupService photoCleanupService,
        IHouseRepository houseRepository,
        IHouseReferenceDataRepository referenceDataRepository,
        IHousePhotoRepository housePhotoRepository)
    {
        _dbContext = dbContext;
        _photoCommitService = photoCommitService;
        _photoCleanupService = photoCleanupService;
        _houseRepository = houseRepository;
        _referenceDataRepository = referenceDataRepository;
        _housePhotoRepository = housePhotoRepository;
    }

    public Task<IReadOnlyCollection<HouseSummaryDto>> GetListAsync(CancellationToken cancellationToken = default)
        => GetListAsync(listingType: null, cancellationToken);

    public async Task<IReadOnlyCollection<HouseSummaryDto>> GetListAsync(
        HouseListingType? listingType,
        CancellationToken cancellationToken = default)
    {
        var houses = await _houseRepository.GetListAsync(listingType, cancellationToken);
        var houseIds = houses.Select(h => h.Id).ToArray();
        var photosByHouse = await _housePhotoRepository.GetPhotosByHouseIdsAsync(houseIds, cancellationToken);

        return houses
            .Select(h => new HouseSummaryDto(
                h.Id,
                h.Name,
                h.Description,
                h.ListingType,
                h.Price,
                h.Currency,
                h.HouseType.Name,
                h.Address.Location.City,
                h.Address.Location.Country,
                photosByHouse.TryGetValue(h.Id, out var ph) ? ph : Array.Empty<HousePhotoDto>()))
            .ToList();
    }

    public async Task<HouseDetailDto?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var house = await _houseRepository.GetDetailAsync(id, cancellationToken);
        if (house == null) return null;

        var photos = await _housePhotoRepository.GetPhotosByHouseIdAsync(id, cancellationToken);

        return new HouseDetailDto(
            house.Id,
            house.Name,
            house.Description,
            house.ListingType,
            house.Price,
            house.Currency,
            house.HouseType.Name,
            house.Address.Line1,
            house.Address.Line2,
            house.Address.Location.City,
            house.Address.Location.Region,
            house.Address.Location.Country,
            house.Address.PostalCode,
            photos);
    }

    public async Task<Guid> CreateAsync(CreateHouseRequest request, Guid? currentUserId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var houseType = await _referenceDataRepository.GetOrCreateHouseTypeAsync(request.HouseTypeName, cancellationToken);
        var location = await _referenceDataRepository.GetOrCreateLocationAsync(request.Address, cancellationToken);
        var address = await _referenceDataRepository.GetOrCreateAddressAsync(location.Id, request.Address, cancellationToken);

        var house = new House
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            Description = request.Description,
            ListingType = request.ListingType,
            Price = request.Price,
            Currency = request.Currency.Trim(),
            HouseTypeId = houseType.Id,
            AddressId = address.Id,
            CreatedAtUtc = now,
            CreatedByUserId = currentUserId
        };

        await _houseRepository.CreateAsync(house, cancellationToken);
        await _houseRepository.SaveChangesAsync(cancellationToken);

        await CommitAndLinkPhotosAsync(house.Id, request.Photos, now, cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return house.Id;
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateHouseRequest request, Guid? currentUserId, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        await using var transaction = await _dbContext.Database.BeginTransactionAsync(cancellationToken);

        var house = await _houseRepository.GetForUpdateAsync(id, cancellationToken);
        if (house == null) return false;

        var houseType = await _referenceDataRepository.GetOrCreateHouseTypeAsync(request.HouseTypeName, cancellationToken);
        var location = await _referenceDataRepository.GetOrCreateLocationAsync(request.Address, cancellationToken);
        var address = await _referenceDataRepository.GetOrCreateAddressAsync(location.Id, request.Address, cancellationToken);

        house.Name = request.Name.Trim();
        house.Description = request.Description;
        house.ListingType = request.ListingType;
        house.Price = request.Price;
        house.Currency = request.Currency.Trim();
        house.HouseTypeId = houseType.Id;
        house.AddressId = address.Id;
        house.UpdatedAtUtc = now;
        house.UpdatedByUserId = currentUserId;

        await _houseRepository.SaveChangesAsync(cancellationToken);

        await RemoveLinkedPhotosAsync(house.Id, request.DeletedPhotoIds, cancellationToken);

        await CommitAndLinkPhotosAsync(house.Id, request.Photos, now, cancellationToken);

        await transaction.CommitAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var house = await _houseRepository.GetForUpdateAsync(id, cancellationToken);
        if (house == null) return false;

        var photoIds = await _housePhotoRepository.GetPhotoIdsByHouseIdAsync(id, cancellationToken);

        await _houseRepository.DeleteAsync(house, cancellationToken);
        await _houseRepository.SaveChangesAsync(cancellationToken);

        await _photoCleanupService.CleanupOrphanedPhotosAsync(photoIds, cancellationToken);
        return true;
    }

    public async Task<bool> UnlinkPhotoAsync(Guid houseId, Guid photoId, CancellationToken cancellationToken = default)
    {
        var house = await _houseRepository.GetForUpdateAsync(houseId, cancellationToken);
        if (house == null) return false;

        var removed = await _housePhotoRepository.RemoveLinkAsync(houseId, photoId, cancellationToken);
        if (!removed)
        {
            return false;
        }

        await _housePhotoRepository.SaveChangesAsync(cancellationToken);
        await _photoCleanupService.CleanupOrphanedPhotosAsync(new[] { photoId }, cancellationToken);
        return true;
    }

    private async Task CommitAndLinkPhotosAsync(
        Guid houseId,
        IReadOnlyCollection<HouseCommitPhotoItem>? photos,
        DateTime now,
        CancellationToken cancellationToken)
    {
        if (photos == null || photos.Count == 0) return;

        var commitItems = photos
            .Select(p => new CommitPhotoItem(p.StagedUploadId, p.Label, p.SortOrder, StagedUploadTargetType.House))
            .ToArray();

        var commitResults = await _photoCommitService.CommitAsync(commitItems, cancellationToken);

        foreach (var committed in commitResults)
        {
            var exists = await _housePhotoRepository.LinkExistsAsync(houseId, committed.PhotoId, cancellationToken);
            if (exists) continue;

            _housePhotoRepository.AddLink(new HousePhoto
            {
                HouseId = houseId,
                PhotoId = committed.PhotoId,
                Label = committed.Label,
                SortOrder = committed.SortOrder,
                CreatedAtUtc = now
            });
        }

        await _housePhotoRepository.SaveChangesAsync(cancellationToken);
    }

    private async Task RemoveLinkedPhotosAsync(
        Guid houseId,
        IReadOnlyCollection<Guid>? photoIds,
        CancellationToken cancellationToken)
    {
        if (photoIds == null || photoIds.Count == 0) return;

        var removed = new List<Guid>(photoIds.Count);

        foreach (var photoId in photoIds)
        {
            if (await _housePhotoRepository.RemoveLinkAsync(houseId, photoId, cancellationToken))
            {
                removed.Add(photoId);
            }
        }

        if (removed.Count == 0) return;

        await _housePhotoRepository.SaveChangesAsync(cancellationToken);
        await _photoCleanupService.CleanupOrphanedPhotosAsync(removed, cancellationToken);
    }
}
