namespace Server.Modules.Exchange.Contracts.Exchange.Dtos;

/// <summary>
/// One point on a pair's rate history.
/// </summary>
public sealed record ExchangeRatePointDto(
    DateTime CapturedAtUtc,
    decimal Rate);

/// <summary>
/// Everything the exchange screen shows for a single currency pair: the current
/// rate, how it moved, the window it moved within, and the series behind the
/// chart. Delivered as one payload because the page renders all of it at once --
/// a per-pair history call would be a request per row.
/// </summary>
public sealed record ExchangeRateSummaryDto(
    string BaseCurrencyCode,
    string QuoteCurrencyCode,
    decimal Rate,
    DateTime CapturedAtUtc,
    decimal? PreviousRate,
    decimal? ChangePercent,
    decimal? WindowLow,
    decimal? WindowHigh,
    IReadOnlyList<ExchangeRatePointDto> Points);
