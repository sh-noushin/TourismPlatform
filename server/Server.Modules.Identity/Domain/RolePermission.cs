using Server.SharedKernel.Primitives;

namespace Server.Modules.Identity.Domain;

public class RolePermission : AuditableEntity
{
    public Guid RoleId { get; set; }
    public Guid PermissionId { get; set; }

    public ApplicationRole? Role { get; set; }
    public PermissionDefinition? Permission { get; set; }
}
