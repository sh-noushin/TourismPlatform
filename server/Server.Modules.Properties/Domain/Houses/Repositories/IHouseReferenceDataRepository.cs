using Server.Modules.Properties.Contracts.Houses;

namespace Server.Modules.Properties.Domain.Houses.Repositories;

public interface IHouseReferenceDataRepository
{
    Task<HouseType> GetOrCreateHouseTypeAsync(string houseTypeName, CancellationToken cancellationToken = default);
    Task<Location> GetOrCreateLocationAsync(AddressRequest request, CancellationToken cancellationToken = default);
    Task<Address> GetOrCreateAddressAsync(Guid locationId, AddressRequest request, CancellationToken cancellationToken = default);
}
