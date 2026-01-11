using System;

namespace Server.Modules.PublicWeb.Domain;

public sealed class PublicSection
{
    private PublicSection()
    {
    }

    public PublicSection(string locale, string id, PublicSectionType sectionType)
    {
        Locale = locale;
        Id = id;
        SectionType = sectionType;
        EntityId = Guid.NewGuid();
    }

    public Guid EntityId { get; private set; }
    public string Locale { get; private set; } = string.Empty;
    public string Id { get; private set; } = string.Empty;
    public PublicSectionType SectionType { get; private set; }
    public string Header { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;

    public void Update(PublicSectionType sectionType, string header, string content)
    {
        SectionType = sectionType;
        Header = header;
        Content = content;
    }
}
