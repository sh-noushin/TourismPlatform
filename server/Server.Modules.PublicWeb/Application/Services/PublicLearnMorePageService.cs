using System;
using System.Threading;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Services;
using Server.Modules.PublicWeb.Domain;
using Server.Modules.PublicWeb.Infrastructure.Repositories;

namespace Server.Modules.PublicWeb.Application.Services;

public sealed class PublicLearnMorePageService : IPublicLearnMorePageService
{
    private readonly IPublicLearnMorePageRepository _repository;

    public PublicLearnMorePageService(IPublicLearnMorePageRepository repository)
    {
        _repository = repository;
    }

    public async Task<PublicLearnMorePageDto?> GetByLocaleAsync(string locale, CancellationToken cancellationToken = default)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var entity = await _repository.GetByLocaleAsync(normalized, cancellationToken);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<PublicLearnMorePageDto> UpsertAsync(string locale, UpsertPublicLearnMorePageRequest request, CancellationToken cancellationToken = default)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var entity = await _repository.GetByLocaleAsync(normalized, cancellationToken);

        if (entity is null)
        {
            entity = new PublicLearnMorePage(normalized);
            await _repository.CreateAsync(entity, cancellationToken);
        }

        entity.Title = request.Title;
        entity.Heading = request.Heading;
        entity.Body = request.Body;
        entity.ImageUrl = request.ImageUrl ?? string.Empty;
        entity.PrimaryButtonText = request.PrimaryButtonText ?? string.Empty;
        entity.PrimaryButtonUrl = request.PrimaryButtonUrl ?? string.Empty;
        entity.IsActive = request.IsActive;

        await _repository.SaveChangesAsync(cancellationToken);

        return ToDto(entity);
    }

    private static PublicLearnMorePageDto ToDto(PublicLearnMorePage entity)
    {
        return new PublicLearnMorePageDto(
            entity.Locale,
            entity.Title,
            entity.Heading,
            entity.Body,
            string.IsNullOrWhiteSpace(entity.ImageUrl) ? null : entity.ImageUrl,
            string.IsNullOrWhiteSpace(entity.PrimaryButtonText) ? null : entity.PrimaryButtonText,
            string.IsNullOrWhiteSpace(entity.PrimaryButtonUrl) ? null : entity.PrimaryButtonUrl,
            entity.IsActive);
    }
}
