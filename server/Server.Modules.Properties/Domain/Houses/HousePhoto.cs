namespace Server.Modules.Properties.Domain.Houses;

public sealed class HousePhoto
{
    public Guid HouseId { get; set; }
    public House House { get; set; } = null!;

    public Guid PhotoId { get; set; }

    public string Label { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
