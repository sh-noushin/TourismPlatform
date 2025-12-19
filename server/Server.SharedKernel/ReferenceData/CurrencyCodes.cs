using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

#pragma warning disable CS8601
namespace Server.SharedKernel.ReferenceData;

public static class CurrencyCodes
{
    private const string CurrencyFileName = "currencies.json";

    private static readonly CurrencyInfo[] KnownCurrencies = new[]
    {
        new CurrencyInfo("USD", "US Dollar"),
        new CurrencyInfo("EUR", "Euro"),
        new CurrencyInfo("GBP", "British Pound"),
        new CurrencyInfo("CAD", "Canadian Dollar"),
        new CurrencyInfo("JPY", "Japanese Yen")
    };

    private static readonly Dictionary<string, CurrencyInfo> CurrencyLookup = new(StringComparer.OrdinalIgnoreCase);

    static CurrencyCodes()
    {
        foreach (var entry in LoadCurrencies())
        {
            CurrencyLookup[entry.Key] = entry.Value;
        }
    }

    public static IReadOnlyCollection<CurrencyInfo> Known => CurrencyLookup.Values;

    public static string Normalize(string? input) => (input ?? string.Empty).Trim().ToUpperInvariant();

    public static bool TryGet(string? input, out CurrencyInfo currency)
        => CurrencyLookup.TryGetValue(Normalize(input), out currency);

    public static bool Contains(string? input) => TryGet(input, out _);

    private static Dictionary<string, CurrencyInfo> LoadCurrencies()
    {
        var fallback = KnownCurrencies.ToDictionary(c => c.Code, StringComparer.OrdinalIgnoreCase);
        var filePath = Path.Combine(AppContext.BaseDirectory, "ReferenceData", CurrencyFileName);
        var loaded = TryLoadFromFile(filePath) ?? TryLoadFromResource();
        return loaded ?? fallback;
    }

    private static Dictionary<string, CurrencyInfo>? TryLoadFromFile(string path)
    {
        if (!File.Exists(path))
        {
            return null;
        }

        var json = File.ReadAllText(path);
        return TryParse(json);
    }

    private static Dictionary<string, CurrencyInfo>? TryLoadFromResource()
    {
        var resourceName = $"{typeof(CurrencyCodes).Namespace}.{CurrencyFileName}";
        var assembly = typeof(CurrencyCodes).Assembly;
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            return null;
        }

        using var reader = new StreamReader(stream);
        var json = reader.ReadToEnd();
        return TryParse(json);
    }

    private static Dictionary<string, CurrencyInfo>? TryParse(string json)
    {
        try
        {
            var items = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
            if (items == null || items.Count == 0)
            {
                return null;
            }

            return items
                .Select(kvp => new CurrencyInfo(kvp.Key, kvp.Value))
                .ToDictionary(info => info.Code, StringComparer.OrdinalIgnoreCase);
        }
        catch (JsonException)
        {
            return null;
        }
        catch (IOException)
        {
            return null;
        }
        catch
        {
            return null;
        }
    }
#pragma warning restore CS8601
}
