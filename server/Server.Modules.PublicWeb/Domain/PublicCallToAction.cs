namespace Server.Modules.PublicWeb.Domain;

public sealed class PublicCallToAction
{
    public string Id { get; set; } = default!;
    public string Locale { get; set; } = default!;
    public string Text { get; set; } = default!;
    public string Url { get; set; } = default!;
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}
