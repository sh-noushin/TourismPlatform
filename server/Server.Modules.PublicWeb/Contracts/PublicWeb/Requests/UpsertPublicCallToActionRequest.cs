namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

public sealed class UpsertPublicCallToActionRequest
{
    public string Text { get; init; } = string.Empty;
    public string Url { get; init; } = string.Empty;
    public int Order { get; init; }
    public bool IsActive { get; init; } = true;
}
