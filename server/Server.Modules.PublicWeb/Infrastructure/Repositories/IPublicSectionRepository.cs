using Server.Modules.PublicWeb.Domain;
using Server.SharedKernel.Repositories;

namespace Server.Modules.PublicWeb.Infrastructure.Repositories;

public interface IPublicSectionRepository : IBaseRepository<PublicSection>
{
    Task<PublicSection?> GetAsync(string sectionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<PublicSection>> ListAsync(CancellationToken cancellationToken = default);
}
