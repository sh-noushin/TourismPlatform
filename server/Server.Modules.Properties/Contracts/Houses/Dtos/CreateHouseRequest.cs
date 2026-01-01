namespace Server.Modules.Properties.Contracts.Houses.Dtos;

using Server.Modules.Properties.Domain.Houses;

public sealed record CreateHouseRequest(
    string Name,
    string? Description,
    HouseListingType ListingType,
    string HouseTypeName,
    AddressRequest Address,
    IReadOnlyCollection<HouseCommitPhotoItem>? Photos);