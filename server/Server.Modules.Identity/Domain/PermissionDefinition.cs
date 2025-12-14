using Server.SharedKernel.Primitives;

namespace Server.Modules.Identity.Domain;

public class PermissionDefinition : AuditableEntity
{
    public string Code { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsEnabled { get; set; } = true;

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
    public ICollection<UserPermission> UserPermissions { get; set; } = new List<UserPermission>();
}
