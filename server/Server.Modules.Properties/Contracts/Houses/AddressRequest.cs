namespace Server.Modules.Properties.Contracts.Houses;

public sealed record AddressRequest(
    string Line1,
    string? Line2,
    string City,
    string? Region,
    string Country,
    string? PostalCode);
