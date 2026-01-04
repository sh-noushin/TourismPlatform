namespace Server.Modules.Exchange.Domain.Currencies;

public sealed class Currency
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
}
