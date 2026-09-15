using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Server.Modules.Exchange.Domain.Currencies.Repositories;
using Server.Modules.Exchange.Domain.Rates;
using Server.Modules.Exchange.Domain.Rates.Repositories;

namespace Server.Modules.Exchange.Infrastructure.RateFeed;

/// <param name="Imported">Snapshots written. Zero is normal when nothing moved.</param>
/// <param name="Configured">False when no API key is set, so the feed never ran.</param>
public sealed record RateImportResult(int Imported, bool Configured);

public interface IRateFeedImporter
{
    /// <summary>
    /// Pulls the feed and stores a snapshot per pair.
    /// </summary>
    Task<RateImportResult> ImportAsync(CancellationToken cancellationToken = default);
}

/// <summary>
/// Kept separate from ExchangeService on purpose: reading rates and ingesting
/// them are different jobs with different dependencies, and the query service
/// has no business holding an HTTP client.
/// </summary>
public sealed class RateFeedImporter : IRateFeedImporter
{
    private readonly IRateFeedClient _feed;
    private readonly ICurrencyRepository _currencyRepository;
    private readonly IExchangeRateRepository _rateRepository;
    private readonly IOptions<NavasanOptions> _options;
    private readonly ILogger<RateFeedImporter> _logger;

    public RateFeedImporter(
        IRateFeedClient feed,
        ICurrencyRepository currencyRepository,
        IExchangeRateRepository rateRepository,
        IOptions<NavasanOptions> options,
        ILogger<RateFeedImporter> logger)
    {
        _feed = feed;
        _currencyRepository = currencyRepository;
        _rateRepository = rateRepository;
        _options = options;
        _logger = logger;
    }

    public async Task<RateImportResult> ImportAsync(CancellationToken cancellationToken = default)
    {
        if (!_feed.IsConfigured) return new RateImportResult(0, Configured: false);

        var quotes = await _feed.GetLatestAsync(cancellationToken);
        if (quotes.Count == 0) return new RateImportResult(0, Configured: true);

        var quoteCode = _options.Value.QuoteCurrencyCode.Trim().ToUpperInvariant();
        var codes = quotes.Select(q => q.CurrencyCode).Append(quoteCode).Distinct().ToArray();
        var currencies = await _currencyRepository.GetByCodesAsync(codes, cancellationToken);

        if (!currencies.TryGetValue(quoteCode, out var quoteCurrency))
        {
            _logger.LogWarning(
                "Quote currency {Code} is not in the Currencies table; skipping the feed import.",
                quoteCode);
            return new RateImportResult(0, Configured: true);
        }

        var written = 0;

        // A pair can only be written once per run. Duplicates inside one batch
        // do not merely skip a row -- SQL Server rejects the whole batch, so a
        // single repeated currency stops every other rate from importing too.
        var staged = new HashSet<(Guid Base, DateTime At)>();

        foreach (var quote in quotes)
        {
            if (!currencies.TryGetValue(quote.CurrencyCode, out var baseCurrency))
            {
                _logger.LogWarning("Feed returned unknown currency {Code}; skipping.", quote.CurrencyCode);
                continue;
            }

            if (!staged.Add((baseCurrency.Id, quote.CapturedAtUtc)))
            {
                continue;
            }

            // Exact-duplicate guard first: two API instances overlapping during a
            // restart would otherwise both write the same reading into an empty
            // table, which the "latest" check below cannot catch.
            if (await _rateRepository.ExistsAsync(
                    baseCurrency.Id, quoteCurrency.Id, quote.CapturedAtUtc, cancellationToken))
            {
                continue;
            }

            // The feed republishes the same quote between refreshes, so skip a
            // reading already held. Without this the table fills with duplicates
            // and every chart flattens into a staircase.
            var latest = await _rateRepository.GetLatestForPairAsync(
                baseCurrency.Id, quoteCurrency.Id, cancellationToken);

            if (latest != null &&
                latest.Rate == quote.Rate &&
                latest.CapturedAtUtc >= quote.CapturedAtUtc)
            {
                continue;
            }

            await _rateRepository.CreateAsync(new ExchangeRateSnapshot
            {
                Id = Guid.NewGuid(),
                BaseCurrencyId = baseCurrency.Id,
                QuoteCurrencyId = quoteCurrency.Id,
                Rate = quote.Rate,
                CapturedAtUtc = quote.CapturedAtUtc
            }, cancellationToken);

            written++;
        }

        if (written > 0)
        {
            try
            {
                await _rateRepository.SaveChangesAsync(cancellationToken);
                _logger.LogInformation("Stored {Count} exchange rate snapshots from the feed.", written);
            }
            catch (DbUpdateException ex) when (IsDuplicateKey(ex))
            {
                // Another instance stored the same reading first -- the unique
                // index did its job. Nothing is lost and nothing is wrong.
                _logger.LogInformation("These rates were already stored by another instance; skipping.");
                return new RateImportResult(0, Configured: true);
            }
        }

        return new RateImportResult(written, Configured: true);
    }

    /// <summary>
    /// Recognises a unique-index violation without taking a dependency on a
    /// database provider: this module targets EF Core only, and referencing
    /// SqlClient here would tie it to SQL Server. SQL Server reports 2601/2627,
    /// PostgreSQL 23505, SQLite "UNIQUE constraint failed" -- all of which name
    /// the violation in the message.
    /// </summary>
    private static bool IsDuplicateKey(DbUpdateException ex)
    {
        var message = ex.InnerException?.Message ?? ex.Message;
        return message.Contains("duplicate key", StringComparison.OrdinalIgnoreCase)
            || message.Contains("UNIQUE constraint failed", StringComparison.OrdinalIgnoreCase)
            || message.Contains("23505", StringComparison.Ordinal);
    }
}
