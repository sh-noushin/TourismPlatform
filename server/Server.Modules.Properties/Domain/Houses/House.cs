namespace Server.Modules.Properties.Domain.Houses;

public sealed class House
{
    public Guid Id { get; set; }

    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }

    public HouseListingType ListingType { get; set; } = HouseListingType.Buy;

    public decimal Price { get; set; }
    public string Currency { get; set; } = "USD";

    public Guid HouseTypeId { get; set; }
    public HouseType HouseType { get; set; } = null!;

    public Guid AddressId { get; set; }
    public Address Address { get; set; } = null!;

    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
    public Guid? CreatedByUserId { get; set; }
    public Guid? UpdatedByUserId { get; set; }

    public ICollection<HousePhoto> Photos { get; set; } = new List<HousePhoto>();
}
