namespace Server.Modules.Identity.Contracts.Permissions;

public sealed record CreatePermissionDefinitionRequest(string Code, string? Description, bool IsEnabled);
