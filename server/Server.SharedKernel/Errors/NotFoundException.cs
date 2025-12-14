namespace Server.SharedKernel.Errors;

public class NotFoundException : DomainException
{
    public NotFoundException()
    {
    }

    public NotFoundException(string message) : base(message)
    {
    }
}
