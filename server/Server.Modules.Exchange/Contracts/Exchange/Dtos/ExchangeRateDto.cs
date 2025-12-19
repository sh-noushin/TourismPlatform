namespace Server.Modules.Exchange.Contracts.Exchange.Dtos;

public sealed record ExchangeRateDto(
    string BaseCurrencyCode,
    string QuoteCurrencyCode,
    decimal Rate,
    DateTime CapturedAtUtc);
