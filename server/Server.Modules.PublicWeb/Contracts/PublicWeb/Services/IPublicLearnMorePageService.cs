using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Services;

public interface IPublicLearnMorePageService
{
    Task<PublicLearnMorePageDto?> GetByLocaleAsync(string locale, CancellationToken cancellationToken = default);
    Task<PublicLearnMorePageDto> UpsertAsync(string locale, UpsertPublicLearnMorePageRequest request, CancellationToken cancellationToken = default);
}
