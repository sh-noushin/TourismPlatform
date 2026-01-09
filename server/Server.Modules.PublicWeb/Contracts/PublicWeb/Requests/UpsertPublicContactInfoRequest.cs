namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

public sealed class UpsertPublicContactInfoRequest
{
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public bool IsActive { get; set; } = true;
}
