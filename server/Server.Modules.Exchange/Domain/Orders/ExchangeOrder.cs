using Server.Modules.Exchange.Domain.Currencies;

namespace Server.Modules.Exchange.Domain.Orders;

public sealed class ExchangeOrder
{
    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public Guid BaseCurrencyId { get; set; }
    public Currency BaseCurrency { get; set; } = null!;

    public Guid QuoteCurrencyId { get; set; }
    public Currency QuoteCurrency { get; set; } = null!;

    public decimal BaseAmount { get; set; }
    public decimal Rate { get; set; }
    public decimal QuoteAmount { get; set; }

    public ExchangeOrderStatus Status { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime? UpdatedAtUtc { get; set; }
}
