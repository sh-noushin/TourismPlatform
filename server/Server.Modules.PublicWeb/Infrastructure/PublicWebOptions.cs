namespace Server.Modules.PublicWeb.Infrastructure;

public sealed class PublicWebOptions
{
    public string SectionsFilePath { get; init; } = "public-web-data/sections.json";
    public string CallToActionsFilePath { get; init; } = "public-web-data/call-to-actions.json";
}
