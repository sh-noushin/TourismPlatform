namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

using System.Text.Json.Serialization;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Serialization;

public sealed class UpsertPublicSectionRequest
{
    [JsonConverter(typeof(PublicSectionTypeJsonConverter))]
    public Domain.PublicSectionType SectionType { get; set; }
    public string Header { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
