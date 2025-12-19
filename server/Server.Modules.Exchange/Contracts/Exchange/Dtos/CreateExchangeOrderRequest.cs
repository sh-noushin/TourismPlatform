namespace Server.Modules.Exchange.Contracts.Exchange.Dtos;

public sealed record CreateExchangeOrderRequest(
    string BaseCurrencyCode,
    string QuoteCurrencyCode,
    decimal BaseAmount);
