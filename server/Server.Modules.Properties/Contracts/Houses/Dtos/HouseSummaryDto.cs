namespace Server.Modules.Properties.Contracts.Houses.Dtos;

using Server.Modules.Properties.Domain.Houses;

public sealed record HouseSummaryDto(
    Guid HouseId,
    string Name,
    HouseListingType ListingType,
    string? HouseTypeName,
    string? City,
    string? Country,
    IReadOnlyCollection<HousePhotoDto> Photos);