namespace Server.Modules.Properties.Contracts.Houses;

public sealed record UpdateHouseRequest(
    string Name,
    string? Description,
    string HouseTypeName,
    AddressRequest Address,
    IReadOnlyCollection<HouseCommitPhotoItem>? Photos);
