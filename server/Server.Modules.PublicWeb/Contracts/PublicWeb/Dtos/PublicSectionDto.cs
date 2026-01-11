namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;

using System.Text.Json.Serialization;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Serialization;

public sealed record PublicSectionDto(
    string Id,
    [property: JsonConverter(typeof(PublicSectionTypeJsonConverter))] Domain.PublicSectionType SectionType,
    string Header,
    string Content);
