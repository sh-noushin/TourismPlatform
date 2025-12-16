using Server.SharedKernel.Primitives;

namespace Server.Modules.Identity.Domain.Permissions;

public class RolePermission : AuditableEntity
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }

    public Roles.ApplicationRole? Role { get; set; }
    public PermissionDefinition? Permission { get; set; }
}
