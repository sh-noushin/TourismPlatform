using System;

namespace Server.Modules.PublicWeb.Domain;

public sealed class PublicLearnMorePage
{
    private PublicLearnMorePage()
    {
    }

    public PublicLearnMorePage(string locale)
    {
        Locale = locale;
        EntityId = Guid.NewGuid();
    }

    public Guid EntityId { get; private set; }
    public string Locale { get; private set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Heading { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public string PrimaryButtonText { get; set; } = string.Empty;
    public string PrimaryButtonUrl { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
