namespace Server.SharedKernel.Errors;

public class ValidationException : DomainException
{
    public ValidationException()
    {
    }

    public ValidationException(string message) : base(message)
    {
    }
}
