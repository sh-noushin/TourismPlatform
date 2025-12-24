using System;
using System.Collections.Generic;
using System.Threading;
using Server.Modules.Properties.Contracts.Houses.Dtos;

namespace Server.Modules.Properties.Domain.Houses.Repositories;

public interface IHouseReferenceDataRepository
{
    Task<HouseType> GetOrCreateHouseTypeAsync(string houseTypeName, CancellationToken cancellationToken = default);
    Task<HouseType?> GetHouseTypeByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<HouseType?> GetHouseTypeByNameAsync(string name, CancellationToken cancellationToken = default);
    Task<HouseType> CreateHouseTypeAsync(string name, CancellationToken cancellationToken = default);
    Task<HouseType?> UpdateHouseTypeAsync(Guid id, string name, CancellationToken cancellationToken = default);
    Task<bool> DeleteHouseTypeAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Location> GetOrCreateLocationAsync(AddressRequest request, CancellationToken cancellationToken = default);
    Task<Address> GetOrCreateAddressAsync(Guid locationId, AddressRequest request, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<HouseType>> GetHouseTypesAsync(CancellationToken cancellationToken = default);
}
