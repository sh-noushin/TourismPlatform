namespace Server.Modules.Tours.Domain.Tours;

public sealed class TourCategory
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    /// <summary>English name; null falls back to the Persian.</summary>
    public string? NameEn { get; set; }
}
