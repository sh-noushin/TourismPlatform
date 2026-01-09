using Server.Modules.PublicWeb.Domain;
using Server.SharedKernel.Repositories;

namespace Server.Modules.PublicWeb.Infrastructure.Repositories;

public interface IPublicCallToActionRepository : IBaseRepository<PublicCallToAction>
{
    Task<PublicCallToAction?> GetAsync(string locale, string actionId, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<PublicCallToAction>> ListByLocaleAsync(string locale, CancellationToken cancellationToken = default);
}
