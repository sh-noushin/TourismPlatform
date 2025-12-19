namespace Server.Modules.Tours.Domain.Tours;

public sealed class TourPhoto
{
    public Guid TourId { get; set; }
    public Tour Tour { get; set; } = null!;

    public Guid PhotoId { get; set; }

    public string Label { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
