using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Server.Modules.PublicWeb.Domain;
using Server.Modules.PublicWeb.Infrastructure;

namespace Server.Modules.PublicWeb.Infrastructure.Storage;

public sealed class JsonCallToActionStore : ICallToActionStore
{
    private readonly string _filePath;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly ILogger<JsonCallToActionStore> _logger;

    public JsonCallToActionStore(IOptions<PublicWebOptions> options, IHostEnvironment environment, ILogger<JsonCallToActionStore> logger)
    {
        var configured = options.Value.CallToActionsFilePath;
        _filePath = Path.GetFullPath(Path.Combine(environment.ContentRootPath, configured));
        var folder = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(folder))
        {
            Directory.CreateDirectory(folder);
        }

        _logger = logger;
        EnsureFileExistsAsync().GetAwaiter().GetResult();
    }

    public async Task<IReadOnlyCollection<PublicCallToAction>> GetAsync(CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            if (!File.Exists(_filePath))
            {
                await WriteDefaultsAsync(cancellationToken);
            }

            var payload = await File.ReadAllTextAsync(_filePath, cancellationToken);
            if (string.IsNullOrWhiteSpace(payload))
            {
                var defaults = DefaultPublicCallToActionData.GetDefaults();
                await File.WriteAllTextAsync(_filePath, JsonSerializer.Serialize(defaults, _jsonOptions), cancellationToken);
                return defaults;
            }

            var actions = JsonSerializer.Deserialize<List<PublicCallToAction>>(payload, _jsonOptions);
            return actions is null ? Array.Empty<PublicCallToAction>() : actions;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task SaveAsync(IEnumerable<PublicCallToAction> actions, CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var data = actions.ToList();
            var payload = JsonSerializer.Serialize(data, _jsonOptions);
            await File.WriteAllTextAsync(_filePath, payload, cancellationToken);
        }
        finally
        {
            _lock.Release();
        }
    }

    private async Task EnsureFileExistsAsync()
    {
        if (File.Exists(_filePath))
        {
            return;
        }

        await WriteDefaultsAsync();
    }

    private async Task WriteDefaultsAsync(CancellationToken cancellationToken = default)
    {
        var defaults = DefaultPublicCallToActionData.GetDefaults();
        var payload = JsonSerializer.Serialize(defaults, _jsonOptions);
        await File.WriteAllTextAsync(_filePath, payload, cancellationToken);
        _logger.LogInformation("Created default public web call-to-actions at {Path}", _filePath);
    }
}
