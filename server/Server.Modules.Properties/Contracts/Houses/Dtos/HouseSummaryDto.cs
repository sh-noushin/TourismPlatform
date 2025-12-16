namespace Server.Modules.Properties.Contracts.Houses.Dtos;

public sealed record HouseSummaryDto(
    Guid HouseId,
    string Name,
    string? HouseTypeName,
    string? City,
    string? Country,
    IReadOnlyCollection<HousePhotoDto> Photos);