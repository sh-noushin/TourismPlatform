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

    /// <summary>
    /// English heading and body. Null or blank means "not translated" and the
    /// Persian is shown instead, so a half-translated site degrades to Persian
    /// rather than to an empty section.
    /// </summary>
    public string? HeaderEn { get; set; }
    public string? ContentEn { get; set; }

    public void Update(
        PublicSectionType sectionType,
        string header,
        string content,
        string? headerEn = null,
        string? contentEn = null)
    {
        SectionType = sectionType;
        Header = header;
        Content = content;
        HeaderEn = string.IsNullOrWhiteSpace(headerEn) ? null : headerEn.Trim();
        ContentEn = string.IsNullOrWhiteSpace(contentEn) ? null : contentEn.Trim();
    }
}
