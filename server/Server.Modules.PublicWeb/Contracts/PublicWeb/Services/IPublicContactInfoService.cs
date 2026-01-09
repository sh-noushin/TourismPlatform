using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Services;

public interface IPublicContactInfoService
{
    Task<PublicContactInfoDto?> GetByLocaleAsync(string locale, CancellationToken cancellationToken = default);
    Task<PublicContactInfoDto> UpsertAsync(string locale, UpsertPublicContactInfoRequest request, CancellationToken cancellationToken = default);
}
