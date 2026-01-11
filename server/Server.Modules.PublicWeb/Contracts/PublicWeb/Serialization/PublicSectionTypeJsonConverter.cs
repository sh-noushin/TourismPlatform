using System;
using System.Text.Json;
using System.Text.Json.Serialization;
using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Serialization;

public sealed class PublicSectionTypeJsonConverter : JsonConverter<PublicSectionType>
{
    public override PublicSectionType Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.Number)
        {
            if (!reader.TryGetInt32(out var numericValue))
            {
                throw new JsonException("Invalid numeric value for PublicSectionType.");
            }

            return (PublicSectionType)numericValue;
        }

        if (reader.TokenType == JsonTokenType.String)
        {
            var raw = reader.GetString();
            if (string.IsNullOrWhiteSpace(raw))
            {
                throw new JsonException("PublicSectionType cannot be empty.");
            }

            if (int.TryParse(raw, out var numericValue))
            {
                return (PublicSectionType)numericValue;
            }

            if (Enum.TryParse<PublicSectionType>(raw, ignoreCase: true, out var parsed))
            {
                return parsed;
            }

            throw new JsonException($"Invalid PublicSectionType value '{raw}'.");
        }

        throw new JsonException($"Unexpected token {reader.TokenType} when parsing PublicSectionType.");
    }

    public override void Write(Utf8JsonWriter writer, PublicSectionType value, JsonSerializerOptions options)
    {
        // Preserve existing API contract (numeric enums) while accepting string inputs.
        writer.WriteNumberValue((int)value);
    }
}
