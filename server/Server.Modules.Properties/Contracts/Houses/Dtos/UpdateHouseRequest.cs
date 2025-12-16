namespace Server.Modules.Properties.Contracts.Houses.Dtos;

public sealed record UpdateHouseRequest(
    string Name,
    string? Description,
    string HouseTypeName,
    AddressRequest Address,
    IReadOnlyCollection<HouseCommitPhotoItem>? Photos);