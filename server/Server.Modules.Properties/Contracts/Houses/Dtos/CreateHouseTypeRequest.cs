namespace Server.Modules.Properties.Contracts.Houses.Dtos;

public sealed record CreateHouseTypeRequest(
    string Name,
    string? NameEn = null);
