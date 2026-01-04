namespace Server.Modules.Properties.Domain.Countries;

public sealed class Country
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
