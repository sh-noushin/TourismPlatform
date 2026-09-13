using System.Collections.Generic;
using System;
using System.Collections.Generic;
using System.Threading;
using Server.Modules.Properties.Contracts.Houses.Dtos;
using Server.SharedKernel.Paging;

namespace Server.Modules.Properties.Application.Services;

public interface IHouseTypeService
{
    Task<IReadOnlyCollection<HouseTypeDto>> GetHouseTypesAsync(CancellationToken cancellationToken = default);
    Task<PagedResult<HouseTypeDto>> GetHouseTypesPagedAsync(PageQuery query, CancellationToken cancellationToken = default);
    Task<HouseTypeDto?> GetHouseTypeAsync(Guid id, CancellationToken cancellationToken = default);
    Task<HouseTypeDto> CreateHouseTypeAsync(CreateHouseTypeRequest request, CancellationToken cancellationToken = default);
    Task UpdateHouseTypeAsync(Guid id, UpdateHouseTypeRequest request, CancellationToken cancellationToken = default);
    Task DeleteHouseTypeAsync(Guid id, CancellationToken cancellationToken = default);
}
