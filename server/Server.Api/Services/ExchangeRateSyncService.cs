using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Server.Modules.Exchange.Application.Services;
using Server.Modules.Exchange.Infrastructure.RateFeed;

namespace Server.Api.Services;

/// <summary>
/// Polls the rate feed on a timer. The interval is deliberately long: the free
/// navasan plan allows 120 calls a month and refreshes its own data every two
/// hours, so a tighter loop would burn the quota for nothing.
/// </summary>
public sealed class ExchangeRateSyncService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly IOptions<NavasanOptions> _options;
    private readonly ILogger<ExchangeRateSyncService> _logger;

    public ExchangeRateSyncService(
        IServiceScopeFactory scopeFactory,
        IOptions<NavasanOptions> options,
        ILogger<ExchangeRateSyncService> logger)
    {
        _scopeFactory = scopeFactory;
        _options = options;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var options = _options.Value;

        // Only the keyed "api" provider needs a credential; the default site
        // provider runs without one.
        var needsKey = string.Equals(options.Provider, "api", StringComparison.OrdinalIgnoreCase);

        if (!options.Enabled || (needsKey && string.IsNullOrWhiteSpace(options.ApiKey)))
        {
            _logger.LogInformation(
                "Exchange rate sync is idle: provider {Provider} is disabled or missing its API key.",
                options.Provider);
            return;
        }

        var interval = TimeSpan.FromMinutes(Math.Max(5, options.SyncIntervalMinutes));
        _logger.LogInformation("Exchange rate sync started; polling every {Minutes} minutes.", interval.TotalMinutes);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var importer = scope.ServiceProvider.GetRequiredService<IRateFeedImporter>();
                await importer.ImportAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                // Never let a bad poll take the host down; the next tick retries.
                _logger.LogError(ex, "Exchange rate sync failed; will retry on the next interval.");
            }

            try
            {
                await Task.Delay(interval, stoppingToken);
            }
            catch (OperationCanceledException)
            {
                break;
            }
        }
    }
}
