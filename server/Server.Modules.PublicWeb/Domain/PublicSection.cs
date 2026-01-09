namespace Server.Modules.PublicWeb.Domain;

public sealed class PublicSection
{
    public string Id { get; init; } = string.Empty;
    public string Locale { get; init; } = string.Empty;
    public string? Tagline { get; set; }
    public string Heading { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string? ImageUrl { get; set; }
    public string? PrimaryCtaText { get; set; }
    public string? PrimaryCtaUrl { get; set; }
    public string? SecondaryCtaText { get; set; }
    public string? SecondaryCtaUrl { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; } = true;
}
