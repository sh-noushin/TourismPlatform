using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Server.Modules.Media.Domain.Uploads;

namespace Server.Modules.Media.Infrastructure;

/// <summary>
/// Ensures required media folders exist under the content root at startup.
/// </summary>
public sealed class MediaDirectoryInitializer : IHostedService
{
    private readonly IHostEnvironment _environment;
    private readonly ILogger<MediaDirectoryInitializer> _logger;

    private static readonly IReadOnlyDictionary<StagedUploadTargetType, string> PermanentFolders =
        new Dictionary<StagedUploadTargetType, string>
        {
            [StagedUploadTargetType.House] = Path.Combine("images", "houses", "photos"),
            [StagedUploadTargetType.Tour] = Path.Combine("images", "tours", "photos")
        };

    public MediaDirectoryInitializer(IHostEnvironment environment, ILogger<MediaDirectoryInitializer> logger)
    {
        _environment = environment;
        _logger = logger;
    }

    public Task StartAsync(CancellationToken cancellationToken)
    {
        try
        {
            EnsureDirectories(StagedUploadFolders.TempFolders.Values);
            EnsureDirectories(PermanentFolders.Values);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create media directories at startup");
        }

        return Task.CompletedTask;
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;

    private void EnsureDirectories(IEnumerable<string> relativePaths)
    {
        foreach (var relative in relativePaths)
        {
            var absolute = Path.Combine(_environment.ContentRootPath, relative);
            try
            {
                Directory.CreateDirectory(absolute);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Unable to create media directory {Directory}", absolute);
            }
        }
    }
}
