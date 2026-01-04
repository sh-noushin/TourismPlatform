namespace Server.Modules.Properties.Contracts.Houses.Dtos;

using Server.Modules.Properties.Domain.Houses;

public sealed record UpdateHouseRequest(
    string Name,
    string? Description,
    HouseListingType ListingType,
    decimal Price,
    string Currency,
    string HouseTypeName,
    AddressRequest Address,
    IReadOnlyCollection<HouseCommitPhotoItem>? Photos,
    IReadOnlyCollection<Guid>? DeletedPhotoIds);