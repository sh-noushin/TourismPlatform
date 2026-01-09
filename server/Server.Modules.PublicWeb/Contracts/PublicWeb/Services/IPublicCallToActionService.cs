using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Services;

public interface IPublicCallToActionService
{
    Task<IReadOnlyCollection<PublicCallToActionDto>> GetCallToActionsAsync(string locale, CancellationToken cancellationToken = default);
    Task<PublicCallToActionDto> UpsertCallToActionAsync(string locale, string id, UpsertPublicCallToActionRequest request, CancellationToken cancellationToken = default);
}
