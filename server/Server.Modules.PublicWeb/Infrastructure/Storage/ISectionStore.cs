using Server.Modules.PublicWeb.Domain;

namespace Server.Modules.PublicWeb.Infrastructure.Storage;

public interface ISectionStore
{
    Task<IReadOnlyCollection<PublicSection>> GetAsync(CancellationToken cancellationToken = default);
    Task SaveAsync(IEnumerable<PublicSection> sections, CancellationToken cancellationToken = default);
}
