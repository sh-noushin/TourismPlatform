namespace Server.Modules.Properties.Domain.Houses;

public sealed class Address
{
    public Guid Id { get; set; }

    public Guid LocationId { get; set; }
    public Location Location { get; set; } = null!;

    public string Line1 { get; set; } = string.Empty;
    public string? Line2 { get; set; }
    public string? PostalCode { get; set; }
}
