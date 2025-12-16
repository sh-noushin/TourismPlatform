namespace Server.Modules.Identity.Contracts.Permissions.Dtos;

public sealed record UpdatePermissionDefinitionRequest(string? Description, bool IsEnabled);