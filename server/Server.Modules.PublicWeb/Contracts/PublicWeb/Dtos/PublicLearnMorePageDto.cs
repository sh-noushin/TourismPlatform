namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;

public sealed record PublicLearnMorePageDto(
    string Locale,
    string Title,
    string Heading,
    string Body,
    string? ImageUrl,
    string? PrimaryButtonText,
    string? PrimaryButtonUrl,
    bool IsActive);
