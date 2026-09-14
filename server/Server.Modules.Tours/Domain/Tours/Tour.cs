namespace Server.Modules.Tours.Domain.Tours;

public sealed class Tour
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    /// <summary>
    /// English name and description. Null means "not translated yet" and the
    /// Persian is shown instead -- the site must never render an empty title
    /// because nobody has got round to the translation.
    /// </summary>
    public string? NameEn { get; set; }
    public string? DescriptionEn { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";
    public string CountryCode { get; set; } = "US";

    public Guid TourCategoryId { get; set; }
    public TourCategory TourCategory { get; set; } = null!;

    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public ICollection<TourSchedule> Schedules { get; set; } = new List<TourSchedule>();
    public ICollection<TourPhoto> Photos { get; set; } = new List<TourPhoto>();
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
