namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;

public sealed record PublicContactInfoDto(
    string Locale,
    string Title,
    string Description,
    string? Email,
    string? Phone,
    string? Address,
    bool IsActive);
