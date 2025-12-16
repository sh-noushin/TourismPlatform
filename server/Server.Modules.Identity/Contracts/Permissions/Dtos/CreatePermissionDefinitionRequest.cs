namespace Server.Modules.Identity.Contracts.Permissions.Dtos;

public sealed record CreatePermissionDefinitionRequest(string Code, string? Description, bool IsEnabled);