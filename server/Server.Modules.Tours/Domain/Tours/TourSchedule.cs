namespace Server.Modules.Tours.Domain.Tours;

public sealed class TourSchedule
{
    public Guid Id { get; set; }

    public Guid TourId { get; set; }
    public Tour Tour { get; set; } = null!;

    public DateTime StartAtUtc { get; set; }
    public DateTime EndAtUtc { get; set; }
    public int Capacity { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
