namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;

public sealed record PublicCallToActionDto(
    string Id,
    string Locale,
    string Text,
    string Url,
    int SortOrder,
    bool IsActive);
