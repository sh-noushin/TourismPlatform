namespace Server.SharedKernel.Primitives;

public abstract class SoftDeletableEntity : Entity
{
    public bool IsDeleted { get; protected set; }
    public DateTime? DeletedAtUtc { get; protected set; }
}
