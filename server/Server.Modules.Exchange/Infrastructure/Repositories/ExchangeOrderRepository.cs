using Microsoft.EntityFrameworkCore;
using Server.Modules.Exchange.Domain.Orders;
using Server.Modules.Exchange.Domain.Orders.Repositories;
using Server.SharedKernel.Repositories;

namespace Server.Modules.Exchange.Infrastructure.Repositories;

public sealed class ExchangeOrderRepository : BaseRepository<ExchangeOrder>, IExchangeOrderRepository
{
    public ExchangeOrderRepository(DbContext dbContext)
        : base(dbContext)
    {
    }

    public Task<ExchangeOrder?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default)
        => Set.FirstOrDefaultAsync(x => x.Id == id, cancellationToken);
}
