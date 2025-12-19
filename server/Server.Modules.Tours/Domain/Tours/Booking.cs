namespace Server.Modules.Tours.Domain.Tours;

public sealed class Booking
{
    public Guid Id { get; set; }

    public Guid TourId { get; set; }
    public Tour Tour { get; set; } = null!;

    public Guid TourScheduleId { get; set; }
    public TourSchedule TourSchedule { get; set; } = null!;

    public Guid UserId { get; set; }

    public int Seats { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}
