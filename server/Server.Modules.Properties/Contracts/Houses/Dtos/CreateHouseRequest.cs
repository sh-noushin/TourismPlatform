namespace Server.Modules.Properties.Contracts.Houses.Dtos;

using Server.Modules.Properties.Domain.Houses;

// English text sits at the end with defaults on purpose: it is optional, and a
// caller that has no translation should not have to name it.
public sealed record CreateHouseRequest(
    string Name,
    string? Description,
    HouseListingType ListingType,
    decimal Price,
    string Currency,
    string HouseTypeName,
    AddressRequest Address,
    IReadOnlyCollection<HouseCommitPhotoItem>? Photos,
    string? NameEn = null,
    string? DescriptionEn = null);