using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Services;

public interface IPublicSectionService
{
    Task<IReadOnlyCollection<PublicSectionDto>> GetSectionsAsync(string locale, CancellationToken cancellationToken = default);
    Task<PublicSectionDto?> GetSectionAsync(string locale, string id, CancellationToken cancellationToken = default);
    Task<PublicSectionDto> CreateSectionAsync(string locale, CreatePublicSectionRequest request, CancellationToken cancellationToken = default);
    Task<PublicSectionDto> UpsertSectionAsync(string locale, string id, UpsertPublicSectionRequest request, CancellationToken cancellationToken = default);
}
