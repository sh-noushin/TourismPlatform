namespace Server.Modules.Properties.Contracts.Houses;

public sealed record CreateHouseRequest(
    string Name,
    string? Description,
    string HouseTypeName,
    AddressRequest Address,
    IReadOnlyCollection<HouseCommitPhotoItem>? Photos);
