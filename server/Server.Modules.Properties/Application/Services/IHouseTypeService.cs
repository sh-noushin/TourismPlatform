using System.Collections.Generic;
using Server.Modules.Properties.Contracts.Houses.Dtos;

namespace Server.Modules.Properties.Application.Services;

public interface IHouseTypeService
{
    Task<IReadOnlyCollection<HouseTypeDto>> GetHouseTypesAsync(CancellationToken cancellationToken = default);
}
