using System;

namespace Server.Modules.Identity.Contracts.Permissions.Dtos;

public sealed record PermissionDefinitionDto(Guid PermissionId, string Code, string? Description, bool IsEnabled);