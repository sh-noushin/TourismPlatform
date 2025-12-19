using Server.Modules.Exchange.Contracts.Exchange.Dtos;
using Server.Modules.Exchange.Domain.Orders;

namespace Server.Modules.Exchange.Application.Services;

public interface IExchangeService
{
    Task<IReadOnlyCollection<CurrencyDto>> GetCurrenciesAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<ExchangeRateDto>> GetLatestRatesAsync(CancellationToken cancellationToken = default);

    Task<CreateExchangeOrderResult> CreateOrderAsync(Guid userId, CreateExchangeOrderRequest request, CancellationToken cancellationToken = default);
    Task<UpdateExchangeOrderStatusResult> UpdateOrderStatusAsync(Guid orderId, ExchangeOrderStatus status, CancellationToken cancellationToken = default);
}

public sealed record CreateExchangeOrderResult(
    bool IsSuccess,
    Guid? OrderId,
    CreateExchangeOrderError? Error);

public enum CreateExchangeOrderError
{
    Invalid = 0,
    CurrencyNotFound = 1,
    RateNotFound = 2
}

public sealed record UpdateExchangeOrderStatusResult(
    bool IsSuccess,
    UpdateExchangeOrderStatusError? Error);

public enum UpdateExchangeOrderStatusError
{
    NotFound = 0,
    Invalid = 1,
    InvalidTransition = 2
}
