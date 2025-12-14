namespace Server.Modules.Identity.Contracts.Permissions;

public sealed record UpdatePermissionDefinitionRequest(string? Description, bool IsEnabled);
