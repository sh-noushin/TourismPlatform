namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;

public sealed record PublicSectionDto(
    string Id,
    string Locale,
    Domain.PublicSectionType SectionType,
    string Header,
    string Content);
