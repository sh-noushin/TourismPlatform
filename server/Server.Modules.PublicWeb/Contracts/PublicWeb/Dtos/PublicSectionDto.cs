namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;

public sealed record PublicSectionDto(
    string Id,
    Domain.PublicSectionType SectionType,
    string Header,
    string Content);
