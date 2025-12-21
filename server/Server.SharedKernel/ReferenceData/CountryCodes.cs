using System.Text.Json;

#pragma warning disable CS8601
namespace Server.SharedKernel.ReferenceData;

public static class CountryCodes
{
    private const string CountryFileName = "countries.json";

    private static readonly CountryInfo[] KnownCountries = new[]
    {
        new CountryInfo("US", "United States"),
        new CountryInfo("CA", "Canada"),
        new CountryInfo("GB", "United Kingdom"),
        new CountryInfo("FR", "France"),
        new CountryInfo("ES", "Spain")
    };

    private static readonly Dictionary<string, CountryInfo> CountryLookup = new(StringComparer.OrdinalIgnoreCase);

    static CountryCodes()
    {
        foreach (var entry in LoadCountries())
        {
            CountryLookup[entry.Key] = entry.Value;
        }
    }

    public static IReadOnlyCollection<CountryInfo> Known => CountryLookup.Values;

    public static string Normalize(string? input) => (input ?? string.Empty).Trim().ToUpperInvariant();

    public static bool TryGet(string? input, out CountryInfo country)
        => CountryLookup.TryGetValue(Normalize(input), out country);

    public static bool Contains(string? input) => TryGet(input, out _);

    private static Dictionary<string, CountryInfo> LoadCountries()
    {
        var fallback = KnownCountries.ToDictionary(c => c.Code, StringComparer.OrdinalIgnoreCase);
        var filePath = Path.Combine(AppContext.BaseDirectory, "ReferenceData", CountryFileName);
        var loaded = TryLoadFromFile(filePath) ?? TryLoadFromResource();
        return loaded ?? fallback;
    }

    private static Dictionary<string, CountryInfo>? TryLoadFromFile(string path)
    {
        if (!File.Exists(path))
        {
            return null;
        }

        var json = File.ReadAllText(path);
        return TryParse(json);
    }

    private static Dictionary<string, CountryInfo>? TryLoadFromResource()
    {
        var resourceName = $"{typeof(CountryCodes).Namespace}.{CountryFileName}";
        var assembly = typeof(CountryCodes).Assembly;
        using var stream = assembly.GetManifestResourceStream(resourceName);
        if (stream == null)
        {
            return null;
        }

        using var reader = new StreamReader(stream);
        var json = reader.ReadToEnd();
        return TryParse(json);
    }

    private static Dictionary<string, CountryInfo>? TryParse(string json)
    {
        try
        {
            var items = JsonSerializer.Deserialize<Dictionary<string, string>>(json);
            if (items == null || items.Count == 0)
            {
                return null;
            }

            return items
                .Select(kvp => new CountryInfo(kvp.Key, kvp.Value))
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
