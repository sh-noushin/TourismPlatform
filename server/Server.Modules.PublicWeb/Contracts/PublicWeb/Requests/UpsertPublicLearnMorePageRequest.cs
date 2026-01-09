namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

public sealed class UpsertPublicLearnMorePageRequest
{
    public string Title { get; set; } = string.Empty;
    public string Heading { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? PrimaryButtonText { get; set; }
    public string? PrimaryButtonUrl { get; set; }
    public bool IsActive { get; set; } = true;
}
