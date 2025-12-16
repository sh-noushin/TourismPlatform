namespace Server.Modules.Properties.Domain.Houses;

public sealed class Location
{
    public Guid Id { get; set; }
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Region { get; set; }
}
