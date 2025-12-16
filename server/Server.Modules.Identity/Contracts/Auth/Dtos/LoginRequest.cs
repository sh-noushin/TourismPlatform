namespace Server.Modules.Identity.Contracts.Auth.Dtos;

public sealed record LoginRequest(string Email, string Password);