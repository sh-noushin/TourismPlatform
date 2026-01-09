using System;
using System.Collections.Generic;
using System.Linq;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Services;
using Server.Modules.PublicWeb.Domain;
using Server.Modules.PublicWeb.Infrastructure.Storage;

namespace Server.Modules.PublicWeb.Application.Services;

public sealed class PublicSectionService : IPublicSectionService
{
    private readonly ISectionStore _store;

    public PublicSectionService(ISectionStore store)
    {
        _store = store;
    }

    public async Task<IReadOnlyCollection<PublicSectionDto>> GetSectionsAsync(string locale, CancellationToken cancellationToken = default)
    {
        var sections = await _store.GetAsync(cancellationToken);
        return sections
            .Where(s => s.IsActive && string.Equals(s.Locale, locale, StringComparison.OrdinalIgnoreCase))
            .OrderBy(s => s.SortOrder)
            .Select(ToDto)
            .ToList();
    }

    public async Task<PublicSectionDto?> GetSectionAsync(string locale, string id, CancellationToken cancellationToken = default)
    {
        var sections = await _store.GetAsync(cancellationToken);
        var section = sections.FirstOrDefault(s =>
            string.Equals(s.Locale, locale, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(s.Id, id, StringComparison.OrdinalIgnoreCase));

        return section is null ? null : ToDto(section);
    }

    public async Task<PublicSectionDto> UpsertSectionAsync(string locale, string id, UpsertPublicSectionRequest request, CancellationToken cancellationToken = default)
    {
        var sections = (await _store.GetAsync(cancellationToken)).ToList();
        var section = sections.FirstOrDefault(s =>
            string.Equals(s.Locale, locale, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(s.Id, id, StringComparison.OrdinalIgnoreCase));

        if (section is null)
        {
            section = new PublicSection
            {
                Id = id,
                Locale = locale,
            };
            sections.Add(section);
        }

        section.Tagline = request.Tagline;
        section.Heading = request.Heading;
        section.Body = request.Body;
        section.ImageUrl = request.ImageUrl;
        section.PrimaryCtaText = request.PrimaryCta?.Text;
        section.PrimaryCtaUrl = request.PrimaryCta?.Url;
        section.SecondaryCtaText = request.SecondaryCta?.Text;
        section.SecondaryCtaUrl = request.SecondaryCta?.Url;
        section.SortOrder = request.Order;
        section.IsActive = request.IsActive;

        await _store.SaveAsync(sections, cancellationToken);

        return ToDto(section);
    }

    private static PublicSectionDto ToDto(PublicSection section)
    {
        return new PublicSectionDto(
            section.Id,
            section.Locale,
            section.Tagline,
            section.Heading,
            section.Body,
            section.ImageUrl,
            BuildCta(section.PrimaryCtaText, section.PrimaryCtaUrl),
            BuildCta(section.SecondaryCtaText, section.SecondaryCtaUrl),
            section.SortOrder,
            section.IsActive);
    }

    private static PublicSectionCtaDto? BuildCta(string? text, string? url)
    {
        if (string.IsNullOrWhiteSpace(text) || string.IsNullOrWhiteSpace(url))
        {
            return null;
        }

        return new PublicSectionCtaDto(text, url);
    }
}
