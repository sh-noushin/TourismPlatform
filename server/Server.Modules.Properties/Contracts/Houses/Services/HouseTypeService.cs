using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Server.Modules.Properties.Application.Services;
using Server.Modules.Properties.Contracts.Houses.Dtos;
using Server.Modules.Properties.Domain.Houses.Repositories;

namespace Server.Modules.Properties.Contracts.Houses.Services;

public sealed class HouseTypeService : IHouseTypeService
{
    private readonly IHouseReferenceDataRepository _referenceDataRepository;

    public HouseTypeService(IHouseReferenceDataRepository referenceDataRepository)
    {
        _referenceDataRepository = referenceDataRepository;
    }

    public async Task<IReadOnlyCollection<HouseTypeDto>> GetHouseTypesAsync(CancellationToken cancellationToken = default)
    {
        var houseTypes = await _referenceDataRepository.GetHouseTypesAsync(cancellationToken);
        return houseTypes
            .Select(ht => new HouseTypeDto(ht.Id, ht.Name))
            .ToList();
    }

    public async Task<HouseTypeDto?> GetHouseTypeAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var houseType = await _referenceDataRepository.GetHouseTypeByIdAsync(id, cancellationToken);
        if (houseType == null) return null;

        return new HouseTypeDto(houseType.Id, houseType.Name);
    }

    public async Task<HouseTypeDto> CreateHouseTypeAsync(CreateHouseTypeRequest request, CancellationToken cancellationToken = default)
    {
        var created = await _referenceDataRepository.CreateHouseTypeAsync(request.Name, cancellationToken);
        return new HouseTypeDto(created.Id, created.Name);
    }

    public async Task UpdateHouseTypeAsync(Guid id, UpdateHouseTypeRequest request, CancellationToken cancellationToken = default)
    {
        var updated = await _referenceDataRepository.UpdateHouseTypeAsync(id, request.Name, cancellationToken);
        if (updated == null)
        {
            throw new KeyNotFoundException($"House type '{id}' not found.");
        }
    }

    public async Task DeleteHouseTypeAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var deleted = await _referenceDataRepository.DeleteHouseTypeAsync(id, cancellationToken);
        if (!deleted)
        {
            throw new KeyNotFoundException($"House type '{id}' not found.");
        }
    }
}
