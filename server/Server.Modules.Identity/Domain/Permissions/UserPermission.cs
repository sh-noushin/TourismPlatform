using Server.SharedKernel.Primitives;

namespace Server.Modules.Identity.Domain.Permissions;

public class UserPermission : AuditableEntity
{
    public Guid UserId { get; set; }
    public Guid PermissionId { get; set; }

    public Users.ApplicationUser? User { get; set; }
    public PermissionDefinition? Permission { get; set; }
}
