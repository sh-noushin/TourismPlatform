using System;

namespace Server.Modules.Identity.Contracts.Permissions;

public sealed record PermissionDefinitionDto(Guid PermissionId, string Code, string? Description, bool IsEnabled);
