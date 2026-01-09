using Server.Modules.PublicWeb.Domain;
using Server.SharedKernel.Repositories;

namespace Server.Modules.PublicWeb.Infrastructure.Repositories;

public interface IPublicLearnMorePageRepository : IBaseRepository<PublicLearnMorePage>
{
    Task<PublicLearnMorePage?> GetByLocaleAsync(string locale, CancellationToken cancellationToken = default);
}
