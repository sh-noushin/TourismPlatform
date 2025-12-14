namespace Server.SharedKernel.Errors;

public class ForbiddenException : DomainException
{
    public ForbiddenException()
    {
    }

    public ForbiddenException(string message) : base(message)
    {
    }
}
