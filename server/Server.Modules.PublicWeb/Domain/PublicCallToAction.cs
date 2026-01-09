using System;

namespace Server.Modules.PublicWeb.Domain;

public sealed class PublicCallToAction
{
    private PublicCallToAction()
    {
    }

    public PublicCallToAction(string locale, string id)
    {
        Locale = locale;
        Id = id;
        EntityId = Guid.NewGuid();
    }

    public Guid EntityId { get; private set; }
    public string Id { get; private set; } = string.Empty;
    public string Locale { get; private set; } = string.Empty;
    public string Text { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
