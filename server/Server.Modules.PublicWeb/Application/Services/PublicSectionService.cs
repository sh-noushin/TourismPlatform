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

    public async Task<PublicSectionDto> CreateSectionAsync(string locale, CreatePublicSectionRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var sectionId = NormalizeSectionId(request.Id);

        if (await _repository.GetAsync(normalizedLocale, sectionId, cancellationToken) is not null)
        {
            throw new InvalidOperationException($"A section with id '{sectionId}' already exists for locale '{normalizedLocale}'.");
        }

        var section = new PublicSection(normalizedLocale, sectionId, request.SectionType)
        {
            Header = request.Header,
            Content = request.Content
        };

        await _repository.CreateAsync(section, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return ToDto(section);
    }

    public async Task<PublicSectionDto> UpsertSectionAsync(string locale, string id, UpsertPublicSectionRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var normalizedId = id.Trim();
        var section = await _repository.GetAsync(normalizedLocale, normalizedId, cancellationToken);

        if (section is null)
        {
            section = new PublicSection(normalizedLocale, normalizedId, request.SectionType);
            await _repository.CreateAsync(section, cancellationToken);
        }

        section.Update(request.SectionType, request.Header, request.Content);

        await _repository.SaveChangesAsync(cancellationToken);

        return ToDto(section);
    }

    private static PublicSectionDto ToDto(PublicSection section)
    {
        return new PublicSectionDto(
            section.Id,
            section.Locale,
            section.SectionType,
            section.Header,
            section.Content);
    }

    private static string NormalizeSectionId(string? requestedId)
    {
        var trimmedId = requestedId?.Trim();
        return string.IsNullOrWhiteSpace(trimmedId) ? Guid.NewGuid().ToString("N") : trimmedId!;
    }
}
