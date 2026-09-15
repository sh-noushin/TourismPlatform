using System.Text.Json;
using System.Text.Json.Serialization;

namespace Server.Api.Infrastructure.Serialization;

/// <summary>
/// Writes every <see cref="DateTime"/> as UTC, with the trailing Z.
///
/// SQL Server's datetime2 carries no offset, so EF hands back
/// <see cref="DateTimeKind.Unspecified"/>, and System.Text.Json then emits
/// "2026-09-15T17:40:06" -- no Z. JavaScript reads a bare timestamp as *local*
/// time, so a rate published at 17:40 UTC rendered as 17:40 in a browser two
/// hours ahead: neither the publisher's clock nor the reader's.
///
/// Every DateTime this API exposes is UTC by construction (the columns say so:
/// CapturedAtUtc, CreatedAtUtc, StartAtUtc), so stamping the kind on the way
/// out is correct rather than a guess.
/// </summary>
public sealed class UtcDateTimeConverter : JsonConverter<DateTime>
{
    public override DateTime Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetDateTime();

        // Incoming values are normalised the same way: a client that sends an
        // offset gets converted, one that sends none is taken at its word.
        return value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };
    }

    public override void Write(Utf8JsonWriter writer, DateTime value, JsonSerializerOptions options)
    {
        var utc = value.Kind switch
        {
            DateTimeKind.Utc => value,
            DateTimeKind.Local => value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
        };

        writer.WriteStringValue(utc.ToString("yyyy-MM-ddTHH:mm:ss.fffffffZ"));
    }
}

/// <summary>The same treatment for nullable columns.</summary>
public sealed class UtcNullableDateTimeConverter : JsonConverter<DateTime?>
{
    private static readonly UtcDateTimeConverter Inner = new();

    public override DateTime? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Null) return null;
        return Inner.Read(ref reader, typeof(DateTime), options);
    }

    public override void Write(Utf8JsonWriter writer, DateTime? value, JsonSerializerOptions options)
    {
        if (value is null)
        {
            writer.WriteNullValue();
            return;
        }

        Inner.Write(writer, value.Value, options);
    }
}
