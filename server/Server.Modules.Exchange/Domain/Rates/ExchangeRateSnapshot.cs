using Server.Modules.Exchange.Domain.Currencies;

namespace Server.Modules.Exchange.Domain.Rates;

public sealed class ExchangeRateSnapshot
{
    public Guid Id { get; set; }

    public Guid BaseCurrencyId { get; set; }
    public Currency BaseCurrency { get; set; } = null!;

    public Guid QuoteCurrencyId { get; set; }
    public Currency QuoteCurrency { get; set; } = null!;

    public decimal Rate { get; set; }

    public DateTime CapturedAtUtc { get; set; }
}
