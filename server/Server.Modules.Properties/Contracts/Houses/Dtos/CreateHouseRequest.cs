namespace Server.Modules.Properties.Contracts.Houses.Dtos;

public sealed record CreateHouseRequest(
    string Name,
    string? Description,
    string HouseTypeName,
    AddressRequest Address,
    IReadOnlyCollection<HouseCommitPhotoItem>? Photos);