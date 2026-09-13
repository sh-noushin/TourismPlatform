namespace Server.Modules.Exchange.Infrastructure.RateFeed;

/// <summary>
/// Settings for the navasan.tech rate feed (https://www.navasan.tech/webserviceguide/).
/// </summary>
public sealed class NavasanOptions
{
    public const string SectionName = "Navasan";

    /// <summary>
    /// "site" reads the public endpoint navasan.net's own front page uses -- no
    /// key, no quota. "api" uses api.navasan.tech, which needs <see cref="ApiKey"/>
    /// and caps the free tier at 120 calls a month.
    /// </summary>
    public string Provider { get; set; } = "site";

    /// <summary>The public feed behind navasan.net. Used when Provider is "site".</summary>
    public string SiteUrl { get; set; } = "https://www.navasan.net/last_currencies.php";

    /// <summary>
    /// ISO codes to import in "site" mode -- that endpoint is keyed by ISO code,
    /// so no translation table is needed. It carries 174 currencies; these are
    /// the ones the platform prices in.
    /// </summary>
    public List<string> SiteCurrencies { get; set; } = new() { "USD", "EUR", "AED", "GBP", "TRY" };

    /// <summary>
    /// Only needed when Provider is "api". Free keys come from their Telegram
    /// bot and allow 120 calls a month.
    /// </summary>
    public string? ApiKey { get; set; }

    public string BaseUrl { get; set; } = "http://api.navasan.tech/";

    public bool Enabled { get; set; } = true;

    /// <summary>
    /// The public site feed has no quota, so 15 minutes matches how often the
    /// rates actually move. In "api" mode raise this to 360: that tier allows
    /// 120 calls a month and only refreshes every two hours.
    /// </summary>
    public int SyncIntervalMinutes { get; set; } = 15;

    /// <summary>
    /// Navasan quotes in Toman; the platform stores Rial. One Toman is ten Rial.
    /// Set to 1 if a future feed already quotes in Rial.
    /// </summary>
    public decimal ValueMultiplier { get; set; } = 10m;

    /// <summary>The quote side of every pair the feed produces.</summary>
    public string QuoteCurrencyCode { get; set; } = "IRR";

    /// <summary>
    /// Currency code -> navasan item code. Their codes are not ISO: the Tehran
    /// dollar is "usd_sell", the Dubai dirham "aed_sell", sterling "gbp_hav".
    /// </summary>
    public Dictionary<string, string> Items { get; set; } = new()
    {
        ["USD"] = "usd_sell",
        ["EUR"] = "eur",
        ["AED"] = "aed_sell",
        ["GBP"] = "gbp_hav",
        ["TRY"] = "try",
    };
}
