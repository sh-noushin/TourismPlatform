namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

public sealed class UpsertPublicSectionRequest
{
    public string? Tagline { get; set; }
    public string Heading { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public PublicSectionCtaRequest? PrimaryCta { get; set; }
    public PublicSectionCtaRequest? SecondaryCta { get; set; }
    public int Order { get; set; }
    public bool IsActive { get; set; } = true;
}
