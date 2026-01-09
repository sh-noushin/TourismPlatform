using System;
using System.Threading;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Services;
using Server.Modules.PublicWeb.Domain;
using Server.Modules.PublicWeb.Infrastructure.Repositories;

namespace Server.Modules.PublicWeb.Application.Services;

public sealed class PublicContactInfoService : IPublicContactInfoService
{
    private readonly IPublicContactInfoRepository _repository;

    public PublicContactInfoService(IPublicContactInfoRepository repository)
    {
        _repository = repository;
    }

    public async Task<PublicContactInfoDto?> GetByLocaleAsync(string locale, CancellationToken cancellationToken = default)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var entity = await _repository.GetByLocaleAsync(normalized, cancellationToken);
        return entity is null ? null : ToDto(entity);
    }

    public async Task<PublicContactInfoDto> UpsertAsync(string locale, UpsertPublicContactInfoRequest request, CancellationToken cancellationToken = default)
    {
        var normalized = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var entity = await _repository.GetByLocaleAsync(normalized, cancellationToken);

        if (entity is null)
        {
            entity = new PublicContactInfo(normalized);
            await _repository.CreateAsync(entity, cancellationToken);
        }

        entity.Title = request.Title;
        entity.Description = request.Description;
        entity.Email = request.Email ?? string.Empty;
        entity.Phone = request.Phone ?? string.Empty;
        entity.Address = request.Address ?? string.Empty;
        entity.IsActive = request.IsActive;

        await _repository.SaveChangesAsync(cancellationToken);

        return ToDto(entity);
    }

    private static PublicContactInfoDto ToDto(PublicContactInfo entity)
    {
        return new PublicContactInfoDto(
            entity.Locale,
            entity.Title,
            entity.Description,
            string.IsNullOrWhiteSpace(entity.Email) ? null : entity.Email,
            string.IsNullOrWhiteSpace(entity.Phone) ? null : entity.Phone,
            string.IsNullOrWhiteSpace(entity.Address) ? null : entity.Address,
            entity.IsActive);
    }
}
