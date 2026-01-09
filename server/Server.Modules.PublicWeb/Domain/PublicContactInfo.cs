using System;

namespace Server.Modules.PublicWeb.Domain;

public sealed class PublicContactInfo
{
    private PublicContactInfo()
    {
    }

    public PublicContactInfo(string locale)
    {
        Locale = locale;
        EntityId = Guid.NewGuid();
    }

    public Guid EntityId { get; private set; }
    public string Locale { get; private set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
