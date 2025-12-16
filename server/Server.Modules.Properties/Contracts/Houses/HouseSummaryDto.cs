namespace Server.Modules.Properties.Contracts.Houses;

public sealed record HouseSummaryDto(
    Guid HouseId,
    string Name,
    string? HouseTypeName,
    string? City,
    string? Country,
    IReadOnlyCollection<HousePhotoDto> Photos);
