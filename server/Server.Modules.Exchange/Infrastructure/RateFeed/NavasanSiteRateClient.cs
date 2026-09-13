using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Server.Modules.Exchange.Infrastructure.RateFeed;

/// <summary>
/// Reads the feed that navasan.net's own front page uses:
/// https://www.navasan.net/last_currencies.php
///
///   { "usd": { "value": 230200, "date": 1789313273, "change_val": -100, "change_pct": -0.04 }, ... }
///
/// Keyed by ISO code, values in Toman, date in epoch seconds. No API key.
///
/// Why not scrape the HTML page: its table ships placeholder numbers that
/// JavaScript overwrites after load, so parsing the markup yields nonsense
/// (EUR at 5,840 next to USD at 169,600). This endpoint is the same data the
/// page renders, already structured.
///
/// Why not the documented api.navasan.tech: that needs a key issued per account
/// and caps the free tier at 120 calls a month. NavasanRateClient implements it
/// and can be switched on by setting Navasan:Provider to "api".
/// </summary>
public sealed class NavasanSiteRateClient : IRateFeedClient
{
    private readonly HttpClient _http;
    private readonly IOptions<NavasanOptions> _options;
    private readonly ILogger<NavasanSiteRateClient> _logger;

    public NavasanSiteRateClient(
        HttpClient http,
        IOptions<NavasanOptions> options,
        ILogger<NavasanSiteRateClient> logger)
    {
        _http = http;
        _options = options;
        _logger = logger;
    }

    /// <summary>No credentials involved, so this source is always available.</summary>
    public bool IsConfigured => _options.Value.Enabled;

    public async Task<IReadOnlyCollection<FeedRate>> GetLatestAsync(CancellationToken cancellationToken = default)
    {
        var options = _options.Value;
        if (!IsConfigured) return Array.Empty<FeedRate>();

        using var request = new HttpRequestMessage(HttpMethod.Get, options.SiteUrl);
        // The endpoint serves the site's own front page; without a browser-ish
        // UA and referer it answers with an error page instead of JSON.
        request.Headers.TryAddWithoutValidation("User-Agent",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36");
        request.Headers.TryAddWithoutValidation("Referer", "https://www.navasan.net/");
        request.Headers.TryAddWithoutValidation("Accept", "application/json, text/javascript, */*");

        using var response = await _http.SendAsync(request, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            _logger.LogWarning(
                "navasan.net returned {Status}; keeping the last known rates.",
                (int)response.StatusCode);
            return Array.Empty<FeedRate>();
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);

        JsonDocument document;
        try
        {
            document = await JsonDocument.ParseAsync(stream, cancellationToken: cancellationToken);
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "navasan.net returned a payload that is not JSON.");
            return Array.Empty<FeedRate>();
        }

        using (document)
        {
            if (document.RootElement.ValueKind != JsonValueKind.Object)
            {
                _logger.LogWarning("navasan.net returned an unexpected payload shape.");
                return Array.Empty<FeedRate>();
            }

            var wanted = options.SiteCurrencies.Count > 0
                ? options.SiteCurrencies
                : new List<string> { "USD", "EUR", "AED", "GBP", "TRY" };

            var results = new List<FeedRate>(wanted.Count);

            foreach (var currencyCode in wanted)
            {
                var code = currencyCode.Trim().ToUpperInvariant();

                if (!document.RootElement.TryGetProperty(code.ToLowerInvariant(), out var item) ||
                    item.ValueKind != JsonValueKind.Object)
                {
                    _logger.LogWarning("navasan.net has no entry for {Code}; skipping.", code);
                    continue;
                }

                if (!TryReadValue(item, out var toman) || toman <= 0m)
                {
                    _logger.LogWarning("navasan.net sent an unusable value for {Code}; skipping.", code);
                    continue;
                }

                results.Add(new FeedRate(
                    code,
                    toman * options.ValueMultiplier,
                    ReadTimestamp(item)));
            }

            if (results.Count == 0)
            {
                _logger.LogWarning("navasan.net answered but none of the configured currencies were present.");
            }

            return results;
        }
    }

    /// <summary>Numbers arrive bare (230200) here, but as "230,200" elsewhere on the site.</summary>
    private static bool TryReadValue(JsonElement item, out decimal value)
    {
        value = 0m;
        if (!item.TryGetProperty("value", out var raw)) return false;

        return raw.ValueKind switch
        {
            JsonValueKind.Number => raw.TryGetDecimal(out value),
            JsonValueKind.String => decimal.TryParse(
                (raw.GetString() ?? string.Empty).Replace(",", string.Empty),
                System.Globalization.NumberStyles.Any,
                System.Globalization.CultureInfo.InvariantCulture,
                out value),
            _ => false
        };
    }

    /// <summary>
    /// Uses the feed's own timestamp so a quote that has not moved for hours is
    /// stored with the time it was published, not the time we polled.
    /// </summary>
    private static DateTime ReadTimestamp(JsonElement item)
    {
        if (item.TryGetProperty("date", out var date))
        {
            long? seconds = date.ValueKind switch
            {
                JsonValueKind.Number when date.TryGetInt64(out var n) => n,
                JsonValueKind.String when long.TryParse(date.GetString(), out var s) => s,
                _ => null
            };

            if (seconds is > 0)
            {
                // Some navasan endpoints publish milliseconds; both appear on the site.
                var value = seconds.Value > 100_000_000_000L
                    ? DateTimeOffset.FromUnixTimeMilliseconds(seconds.Value)
                    : DateTimeOffset.FromUnixTimeSeconds(seconds.Value);

                return value.UtcDateTime;
            }
        }

        return DateTime.UtcNow;
    }
}
