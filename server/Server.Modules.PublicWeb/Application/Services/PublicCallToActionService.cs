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

public sealed class PublicCallToActionService : IPublicCallToActionService
{
    private readonly IPublicCallToActionRepository _repository;

    public PublicCallToActionService(IPublicCallToActionRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyCollection<PublicCallToActionDto>> GetCallToActionsAsync(string locale, CancellationToken cancellationToken = default)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var actions = await _repository.ListByLocaleAsync(normalizedLocale, cancellationToken);
        return actions
            .Where(a => a.IsActive && string.Equals(a.Locale, normalizedLocale, StringComparison.OrdinalIgnoreCase))
            .OrderBy(a => a.SortOrder)
            .Select(ToDto)
            .ToList();
    }

    public async Task<PublicCallToActionDto> UpsertCallToActionAsync(string locale, string id, UpsertPublicCallToActionRequest request, CancellationToken cancellationToken = default)
    {
        var normalizedLocale = string.IsNullOrWhiteSpace(locale) ? "en" : locale;
        var action = await _repository.GetAsync(normalizedLocale, id, cancellationToken);

        if (action is null)
        {
            action = new PublicCallToAction(normalizedLocale, id);
            await _repository.CreateAsync(action, cancellationToken);
        }

        action.Text = request.Text;
        action.Url = request.Url;
        action.SortOrder = request.Order;
        action.IsActive = request.IsActive;

        await _repository.SaveChangesAsync(cancellationToken);

        return ToDto(action);
    }

    private static PublicCallToActionDto ToDto(PublicCallToAction action)
    {
        return new PublicCallToActionDto(
            action.Id,
            action.Locale,
            action.Text,
            action.Url,
            action.SortOrder,
            action.IsActive);
    }
}
