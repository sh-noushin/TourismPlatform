namespace Server.Modules.Identity.Contracts.Auth.Dtos;

public sealed record LoginResponse(string AccessToken, string RefreshToken);