using Server.Modules.PublicWeb.Contracts.PublicWeb.Dtos;
using Server.Modules.PublicWeb.Contracts.PublicWeb.Requests;

namespace Server.Modules.PublicWeb.Contracts.PublicWeb.Services;

public interface IPublicSectionService
{
    Task<IReadOnlyCollection<PublicSectionDto>> GetSectionsAsync(CancellationToken cancellationToken = default);
    Task<PublicSectionDto?> GetSectionAsync(string id, CancellationToken cancellationToken = default);
    Task<PublicSectionDto> CreateSectionAsync(CreatePublicSectionRequest request, CancellationToken cancellationToken = default);
    Task<PublicSectionDto> UpsertSectionAsync(string id, UpsertPublicSectionRequest request, CancellationToken cancellationToken = default);
}
