namespace Server.Modules.Identity.Contracts.Auth;

public sealed record RegisterRequest(string Email, string Password);
