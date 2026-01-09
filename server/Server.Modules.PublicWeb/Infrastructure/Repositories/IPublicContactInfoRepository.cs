using Server.Modules.PublicWeb.Domain;
using Server.SharedKernel.Repositories;

namespace Server.Modules.PublicWeb.Infrastructure.Repositories;

public interface IPublicContactInfoRepository : IBaseRepository<PublicContactInfo>
{
    Task<PublicContactInfo?> GetByLocaleAsync(string locale, CancellationToken cancellationToken = default);
}
