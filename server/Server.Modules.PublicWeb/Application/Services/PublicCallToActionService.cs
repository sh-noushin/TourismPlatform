using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Services;
using Server.Modules.PublicWeb.Domain;
using Server.Modules.PublicWeb.Infrastructure.Storage;

namespace Server.Modules.PublicWeb.Application.Services;

public sealed class PublicCallToActionService : IPublicCallToActionService
{
    private readonly ICallToActionStore _store;

    public PublicCallToActionService(ICallToActionStore store)
    {
        _store = store;
    }

    public async Task<IReadOnlyCollection<PublicCallToActionDto>> GetCallToActionsAsync(string locale, CancellationToken cancellationToken = default)
    {
        var actions = await _store.GetAsync(cancellationToken);
        return actions
            .Where(a => a.IsActive && string.Equals(a.Locale, locale, StringComparison.OrdinalIgnoreCase))
            .OrderBy(a => a.SortOrder)
            .Select(ToDto)
            .ToList();
    }

    public async Task<PublicCallToActionDto> UpsertCallToActionAsync(string locale, string id, UpsertPublicCallToActionRequest request, CancellationToken cancellationToken = default)
    {
        var actions = (await _store.GetAsync(cancellationToken)).ToList();
        var action = actions.FirstOrDefault(a =>
            string.Equals(a.Locale, locale, StringComparison.OrdinalIgnoreCase) &&
            string.Equals(a.Id, id, StringComparison.OrdinalIgnoreCase));

        if (action is null)
        {
            action = new PublicCallToAction
            {
                Id = id,
                Locale = locale,
            };
            actions.Add(action);
        }

        action.Text = request.Text;
        action.Url = request.Url;
        action.SortOrder = request.Order;
        action.IsActive = request.IsActive;

        await _store.SaveAsync(actions, cancellationToken);

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
