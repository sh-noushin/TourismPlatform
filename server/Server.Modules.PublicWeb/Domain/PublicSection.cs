using System;

namespace Server.Modules.PublicWeb.Domain;

public sealed class PublicSection
{
    private PublicSection()
    {
    }

    public PublicSection(string id, PublicSectionType sectionType)
    {
        Id = id;
        SectionType = sectionType;
        EntityId = Guid.NewGuid();
    }

    public Guid EntityId { get; private set; }
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
