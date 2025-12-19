using Server.Modules.Exchange.Domain.Orders;

namespace Server.Modules.Exchange.Contracts.Exchange.Dtos;

public sealed record UpdateExchangeOrderStatusRequest(ExchangeOrderStatus Status);
