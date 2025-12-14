namespace Server.Modules.Identity.Contracts.Auth;

public sealed record LoginRequest(string Email, string Password);
