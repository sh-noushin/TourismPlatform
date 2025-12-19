using Server.Modules.Exchange.Domain.Orders;

namespace Server.Modules.Exchange.Contracts.Exchange.Dtos;

public sealed record ExchangeOrderDto(
    Guid Id,
    string BaseCurrencyCode,
    string QuoteCurrencyCode,
    decimal BaseAmount,
    decimal Rate,
    decimal QuoteAmount,
    ExchangeOrderStatus Status,
    DateTime CreatedAtUtc);
