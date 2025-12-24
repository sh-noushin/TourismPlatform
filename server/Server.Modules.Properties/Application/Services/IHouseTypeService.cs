using System.Collections.Generic;
using System;
using System.Collections.Generic;
using System.Threading;
using Server.Modules.Properties.Contracts.Houses.Dtos;

namespace Server.Modules.Properties.Application.Services;

public interface IHouseTypeService
{
    Task<IReadOnlyCollection<HouseTypeDto>> GetHouseTypesAsync(CancellationToken cancellationToken = default);
    Task<HouseTypeDto?> GetHouseTypeAsync(Guid id, CancellationToken cancellationToken = default);
    Task<HouseTypeDto> CreateHouseTypeAsync(CreateHouseTypeRequest request, CancellationToken cancellationToken = default);
    Task UpdateHouseTypeAsync(Guid id, UpdateHouseTypeRequest request, CancellationToken cancellationToken = default);
}
