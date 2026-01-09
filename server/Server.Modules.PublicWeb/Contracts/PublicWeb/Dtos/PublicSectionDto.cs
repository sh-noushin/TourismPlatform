using System.Diagnostics.CodeAnalysis;

namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;

public sealed record PublicSectionDto(
    string Id,
    string Locale,
    string? Tagline,
    string Heading,
    string Body,
    string? ImageUrl,
    PublicSectionCtaDto? PrimaryCta,
    PublicSectionCtaDto? SecondaryCta,
    int Order,
    bool IsActive);
