namespace Server.Modules.Properties.Contracts.Houses.Dtos;

using Server.Modules.Properties.Domain.Houses;

public sealed record HouseDetailDto(
    Guid HouseId,
    string Name,
    string? Description,
    HouseListingType ListingType,
    decimal Price,
    string Currency,
    string? HouseTypeName,
    string? Line1,
    string? Line2,
    string? City,
    string? Region,
    string? Country,
    string? PostalCode,
    IReadOnlyCollection<HousePhotoDto> Photos);