using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Services;
using Server.Modules.PublicWeb.Domain;
using Server.Modules.PublicWeb.Infrastructure.Repositories;

namespace Server.Modules.PublicWeb.Application.Services;

public sealed class PublicSectionService : IPublicSectionService
{
    private readonly IPublicSectionRepository _repository;

    public PublicSectionService(IPublicSectionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<PublicSectionDto>> GetSectionsAsync(string locale, CancellationToken cancellationToken = default)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var sections = await _repository.ListByLocaleAsync(normalizedLocale, cancellationToken);
        return sections
            .Select(ToDto)
            .ToList();
    }

    public async Task<PublicSectionDto?> GetSectionAsync(string locale, string id, CancellationToken cancellationToken = default)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var section = await _repository.GetAsync(normalizedLocale, id, cancellationToken);
        return section is null ? null : ToDto(section);
    }

    public async Task<PublicSectionDto> UpsertSectionAsync(string locale, string id, UpsertPublicSectionRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var section = await _repository.GetAsync(normalizedLocale, id, cancellationToken);

        if (section is null)
        {
            section = new PublicSection(normalizedLocale, id);
            await _repository.CreateAsync(section, cancellationToken);
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

        await _repository.SaveChangesAsync(cancellationToken);

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
