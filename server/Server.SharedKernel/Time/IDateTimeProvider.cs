namespace Server.SharedKernel.Time;

public interface IDateTimeProvider
{
    DateTime UtcNow { get; }
}
