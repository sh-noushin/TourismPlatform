using Server.Modules.Identity.Contracts.Auth.Dtos;

namespace Server.Api.Services;

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default);

    Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

    Task<LoginResponse?> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default);

    Task<bool> LogoutAsync(Guid userId, LogoutRequest request, CancellationToken cancellationToken = default);

    Task LogoutAllAsync(Guid userId, CancellationToken cancellationToken = default);
}

public enum AuthResult
{
    Success = 0,
    Conflict = 1,
    Invalid = 2
}
