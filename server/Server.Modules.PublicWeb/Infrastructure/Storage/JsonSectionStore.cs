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

public sealed class JsonSectionStore : ISectionStore
{
    private readonly string _filePath;
    private readonly JsonSerializerOptions _jsonOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true
    };
    private readonly SemaphoreSlim _lock = new(1, 1);
    private readonly ILogger<JsonSectionStore> _logger;

    public JsonSectionStore(IOptions<PublicWebOptions> options, IHostEnvironment environment, ILogger<JsonSectionStore> logger)
    {
        var configured = options.Value.SectionsFilePath;
        _filePath = Path.GetFullPath(Path.Combine(environment.ContentRootPath, configured));
        var folder = Path.GetDirectoryName(_filePath);
        if (!string.IsNullOrEmpty(folder))
        {
            Directory.CreateDirectory(folder);
        }

        _logger = logger;
        EnsureFileExistsAsync().GetAwaiter().GetResult();
    }

    public async Task<IReadOnlyCollection<PublicSection>> GetAsync(CancellationToken cancellationToken = default)
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
                var defaults = DefaultPublicSectionData.GetDefaults();
                await File.WriteAllTextAsync(_filePath, JsonSerializer.Serialize(defaults, _jsonOptions), cancellationToken);
                return defaults;
            }

            var sections = JsonSerializer.Deserialize<List<PublicSection>>(payload, _jsonOptions);
            return sections is null ? Array.Empty<PublicSection>() : sections;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task SaveAsync(IEnumerable<PublicSection> sections, CancellationToken cancellationToken = default)
    {
        await _lock.WaitAsync(cancellationToken);
        try
        {
            var data = sections.ToList();
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
        var defaults = DefaultPublicSectionData.GetDefaults();
        var payload = JsonSerializer.Serialize(defaults, _jsonOptions);
        await File.WriteAllTextAsync(_filePath, payload, cancellationToken);
        _logger.LogInformation("Created default public web sections at {Path}", _filePath);
    }
}
