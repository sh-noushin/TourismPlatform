namespace Server.Modules.Properties.Domain.Houses;

public sealed class HouseType
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>English name; null falls back to the Persian.</summary>
    public string? NameEn { get; set; }
}
