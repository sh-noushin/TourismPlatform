using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Server.Api.Infrastructure.Persistence;
using Server.Api.Infrastructure.Security;
using Server.Modules.Identity.Domain.RefreshTokens;
using Server.Modules.Identity.Domain.Roles;
using Server.Modules.Identity.Domain.Users;
using Server.Modules.Identity.Contracts.Auth.Dtos;
using Server.SharedKernel.Auth;

namespace Server.Api.Services;

public sealed class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ApplicationDbContext _dbContext;
    private readonly JwtSettings _jwtSettings;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<ApplicationRole> roleManager,
        ApplicationDbContext dbContext,
        JwtSettings jwtSettings)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _dbContext = dbContext;
        _jwtSettings = jwtSettings;
    }

    public async Task<AuthResult> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken = default)
    {
        var existing = await _userManager.FindByEmailAsync(request.Email);
        if (existing != null) return AuthResult.Conflict;

        var user = new ApplicationUser
        {
            Email = request.Email,
            UserName = request.Email,
            EmailConfirmed = true
        };

        var create = await _userManager.CreateAsync(user, request.Password);
        if (!create.Succeeded) return AuthResult.Invalid;

        if (!await _roleManager.RoleExistsAsync(Roles.User))
        {
            await _roleManager.CreateAsync(new ApplicationRole { Name = Roles.User });
        }

        await _userManager.AddToRoleAsync(user, Roles.User);
        return AuthResult.Success;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null) return null;

        if (!await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return null;
        }

        var accessToken = await CreateAccessTokenAsync(user);
        var refreshToken = CreateRefreshTokenString();
        var hash = ComputeHash(refreshToken);

        var rt = new RefreshToken
        {
            RefreshTokenId = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = hash,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenMinutes * 24)
        };

        _dbContext.Add(rt);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return new LoginResponse(accessToken, refreshToken);
    }

    public async Task<LoginResponse?> RefreshAsync(RefreshRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = ComputeHash(request.RefreshToken);
        var staged = await _dbContext.Set<RefreshToken>().FirstOrDefaultAsync(r => r.TokenHash == tokenHash, cancellationToken);
        if (staged == null) return null;

        if (staged.RevokedAtUtc != null || staged.ExpiresAtUtc < DateTime.UtcNow) return null;

        var user = await _userManager.FindByIdAsync(staged.UserId.ToString());
        if (user == null) return null;

        staged.RevokedAtUtc = DateTime.UtcNow;
        var newRtString = CreateRefreshTokenString();
        var newHash = ComputeHash(newRtString);
        var newRt = new RefreshToken
        {
            RefreshTokenId = Guid.NewGuid(),
            UserId = staged.UserId,
            TokenHash = newHash,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(30),
            ReplacedByRefreshTokenId = null
        };

        staged.ReplacedByRefreshTokenId = newRt.RefreshTokenId;
        _dbContext.Add(newRt);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var accessToken = await CreateAccessTokenAsync(user);
        return new LoginResponse(accessToken, newRtString);
    }

    public async Task<bool> LogoutAsync(Guid userId, LogoutRequest request, CancellationToken cancellationToken = default)
    {
        var tokenHash = ComputeHash(request.RefreshToken);
        var rt = await _dbContext.Set<RefreshToken>()
            .FirstOrDefaultAsync(r => r.TokenHash == tokenHash && r.UserId == userId, cancellationToken);

        if (rt == null) return false;

        rt.RevokedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task LogoutAllAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        var tokens = await _dbContext.Set<RefreshToken>()
            .Where(r => r.UserId == userId && r.RevokedAtUtc == null)
            .ToListAsync(cancellationToken);

        foreach (var t in tokens) t.RevokedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private string CreateRefreshTokenString()
    {
        var bytes = new byte[64];
        RandomNumberGenerator.Fill(bytes);
        return Convert.ToBase64String(bytes);
    }

    private static string ComputeHash(string token)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(token);
        var hash = sha.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }

    private async Task<string> CreateAccessTokenAsync(ApplicationUser user)
    {
        var handler = new JwtSecurityTokenHandler();
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.Key));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var roles = await _userManager.GetRolesAsync(user);

        var claims = new List<Claim>
        {
            new Claim(System.Security.Claims.ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(System.Security.Claims.ClaimTypes.Email, user.Email ?? string.Empty)
        };

        claims.AddRange(roles.Select(r => new Claim(System.Security.Claims.ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenMinutes),
            signingCredentials: creds);

        return handler.WriteToken(token);
    }
}
