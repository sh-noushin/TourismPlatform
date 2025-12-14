namespace Server.Modules.Identity.Contracts.Auth;

public sealed record LoginResponse(string AccessToken, string RefreshToken);
