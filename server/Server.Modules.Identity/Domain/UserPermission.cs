using Server.SharedKernel.Primitives;

namespace Server.Modules.Identity.Domain;

public class UserPermission : AuditableEntity
{
    public Guid UserId { get; set; }
    public Guid PermissionId { get; set; }

    public ApplicationUser? User { get; set; }
    public PermissionDefinition? Permission { get; set; }
}
