using Server.Modules.Properties.Contracts.Houses.Dtos;

namespace Server.Modules.Properties.Application.Services;

public interface IHouseService
{
    Task<IReadOnlyCollection<HouseSummaryDto>> GetListAsync(CancellationToken cancellationToken = default);
    Task<HouseDetailDto?> GetDetailAsync(Guid id, CancellationToken cancellationToken = default);

    Task<Guid> CreateAsync(CreateHouseRequest request, Guid? currentUserId, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Guid id, UpdateHouseRequest request, Guid? currentUserId, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> UnlinkPhotoAsync(Guid houseId, Guid photoId, CancellationToken cancellationToken = default);
}
