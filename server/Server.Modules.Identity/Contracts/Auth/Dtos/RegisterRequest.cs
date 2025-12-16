namespace Server.Modules.Identity.Contracts.Auth.Dtos;

public sealed record RegisterRequest(string Email, string Password);