using Server.SharedKernel.Repositories;

namespace Server.Modules.Exchange.Domain.Orders.Repositories;

public interface IExchangeOrderRepository : IBaseRepository<ExchangeOrder>
{
    Task<ExchangeOrder?> GetForUpdateAsync(Guid id, CancellationToken cancellationToken = default);
}
