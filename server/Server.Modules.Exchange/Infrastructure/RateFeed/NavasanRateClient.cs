using System.Globalization;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Server.Modules.Exchange.Infrastructure.RateFeed;

/// <summary>One quote as published by the feed, already converted to Rial.</summary>
public sealed record FeedRate(string CurrencyCode, decimal Rate, DateTime CapturedAtUtc);

public interface IRateFeedClient
{
    bool IsConfigured { get; }

    Task<IReadOnlyCollection<FeedRate>> GetLatestAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Reads http://api.navasan.tech/latest/, which answers with an object keyed by
/// item code:
///
///   { "usd_sell": { "value": "112700", "change": -25, "timestamp": 1568212950, ... }, ... }
///
/// Only the items named in <see cref="NavasanOptions.Items"/> are kept, and each
/// value is multiplied into Rial.
/// </summary>
public sealed class NavasanRateClient : IRateFeedClient
{
    private readonly HttpClient _http;
    private readonly IOptions<NavasanOptions> _options;
    private readonly ILogger<NavasanRateClient> _logger;

    public NavasanRateClient(
        HttpClient http,
        IOptions<NavasanOptions> options,
        ILogger<NavasanRateClient> logger)
    {
        _http = http;
        _options = options;
        _logger = logger;
    }

    public bool IsConfigured =>
        _options.Value.Enabled && !string.IsNullOrWhiteSpace(_options.Value.ApiKey);

    public async Task<IReadOnlyCollection<FeedRate>> GetLatestAsync(CancellationToken cancellationToken = default)
    {
        var options = _options.Value;

        if (!IsConfigured)
        {
            _logger.LogWarning("Rate feed is not configured; set Navasan:ApiKey to enable it.");
            return Array.Empty<FeedRate>();
        }

        var url = $"latest/?api_key={Uri.EscapeDataString(options.ApiKey!)}";

        using var response = await _http.GetAsync(url, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            // A quota breach is the expected failure on the free tier, and it is
            // not worth an exception: the previous snapshots stay valid.
            _logger.LogWarning(
                "Rate feed returned {Status}; keeping the last known rates.",
                (int)response.StatusCode);
            return Array.Empty<FeedRate>();
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        using var document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);

        if (document.RootElement.ValueKind != JsonValueKind.Object)
        {
            _logger.LogWarning("Rate feed returned an unexpected payload shape.");
            return Array.Empty<FeedRate>();
        }

        var results = new List<FeedRate>(options.Items.Count);

        foreach (var (currencyCode, itemCode) in options.Items)
        {
            if (!document.RootElement.TryGetProperty(itemCode, out var item)) continue;
            if (item.ValueKind != JsonValueKind.Object) continue;

            if (!TryReadValue(item, out var value)) continue;

            results.Add(new FeedRate(
                currencyCode.Trim().ToUpperInvariant(),
                value * options.ValueMultiplier,
                ReadTimestamp(item)));
        }

        if (results.Count == 0)
        {
            _logger.LogWarning(
                "Rate feed answered but none of the configured items were present.");
        }

        return results;
    }

    /// <summary>The feed sends numbers as JSON strings ("112700"), not numbers.</summary>
    private static bool TryReadValue(JsonElement item, out decimal value)
    {
        value = 0m;
        if (!item.TryGetProperty("value", out var raw)) return false;

        return raw.ValueKind switch
        {
            JsonValueKind.Number => raw.TryGetDecimal(out value),
            JsonValueKind.String => decimal.TryParse(
                raw.GetString(),
                NumberStyles.Any,
                CultureInfo.InvariantCulture,
                out value),
            _ => false
        } && value > 0m;
    }

    /// <summary>
    /// Prefers the feed's own timestamp so a stale quote is stored with the time
    /// it was actually published, not the time we happened to poll.
    /// </summary>
    private static DateTime ReadTimestamp(JsonElement item)
    {
        if (item.TryGetProperty("timestamp", out var ts))
        {
            long? seconds = ts.ValueKind switch
            {
                JsonValueKind.Number when ts.TryGetInt64(out var n) => n,
                JsonValueKind.String when long.TryParse(ts.GetString(), out var s) => s,
                _ => null
            };

            if (seconds is > 0)
            {
                return DateTimeOffset.FromUnixTimeSeconds(seconds.Value).UtcDateTime;
            }
        }

        return DateTime.UtcNow;
    }
}
