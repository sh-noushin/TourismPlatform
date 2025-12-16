namespace Server.Modules.Properties.Contracts.Houses;

public sealed record HouseDetailDto(
    Guid HouseId,
    string Name,
    string? Description,
    string? HouseTypeName,
    string? Line1,
    string? Line2,
    string? City,
    string? Region,
    string? Country,
    string? PostalCode,
    IReadOnlyCollection<HousePhotoDto> Photos);
