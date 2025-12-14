namespace Server.SharedKernel.Primitives;

public abstract class AuditableEntity : Entity
{
    public DateTime CreatedAtUtc { get; protected set; }
    public DateTime? UpdatedAtUtc { get; protected set; }
    public Guid? CreatedByUserId { get; protected set; }
    public Guid? UpdatedByUserId { get; protected set; }
}
