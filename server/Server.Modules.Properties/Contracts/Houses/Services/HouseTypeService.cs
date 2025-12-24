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
}
