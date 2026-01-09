using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Storage;

public interface ICallToActionStore
{
    Task<IReadOnlyCollection<PublicCallToAction>> GetAsync(CancellationToken cancellationToken = default);
    Task SaveAsync(IEnumerable<PublicCallToAction> actions, CancellationToken cancellationToken = default);
}
