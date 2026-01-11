namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

public sealed class UpsertPublicSectionRequest
{
    public Domain.PublicSectionType SectionType { get; set; }
    public string Header { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
}
