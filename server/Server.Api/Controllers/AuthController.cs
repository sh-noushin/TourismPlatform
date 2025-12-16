using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Identity;
using Server.Api.Infrastructure.Persistence;
using Server.Api.Infrastructure.Security;
using Server.Modules.Identity.Contracts.Auth;
using Server.Modules.Identity.Domain.Roles;
using Server.Modules.Identity.Domain.RefreshTokens;
using Server.Modules.Identity.Domain.Users;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly ApplicationDbContext _dbContext;
    private readonly JwtSettings _jwtSettings;

    public AuthController(
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

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var existing = await _userManager.FindByEmailAsync(req.Email);
        if (existing != null) return Conflict(new { message = "Email already registered" });

        var user = new ApplicationUser
        {
            Email = req.Email,
            UserName = req.Email,
            EmailConfirmed = true
        };

        var create = await _userManager.CreateAsync(user, req.Password);
        if (!create.Succeeded) return BadRequest(create.Errors);

        if (!await _roleManager.RoleExistsAsync("User"))
            await _roleManager.CreateAsync(new ApplicationRole { Name = "User" });

        await _userManager.AddToRoleAsync(user, "User");

        return Ok();
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _userManager.FindByEmailAsync(req.Email);
        if (user == null) return Unauthorized();

        if (!await _userManager.CheckPasswordAsync(user, req.Password))
            return Unauthorized();

        var accessToken = await CreateAccessTokenAsync(user);
        var refreshToken = CreateRefreshTokenString();
        var hash = ComputeHash(refreshToken);

        var rt = new RefreshToken
        {
            RefreshTokenId = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = hash,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenMinutes * 24) // long-lived refresh
        };

        _dbContext.Add(rt);
        await _dbContext.SaveChangesAsync();

        return Ok(new LoginResponse(accessToken, refreshToken));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(RefreshRequest req)
    {
        var tokenHash = ComputeHash(req.RefreshToken);
        var staged = await _dbContext.Set<RefreshToken>().FirstOrDefaultAsync(r => r.TokenHash == tokenHash);
        if (staged == null) return Unauthorized();

        if (staged.RevokedAtUtc != null || staged.ExpiresAtUtc < DateTime.UtcNow) return Unauthorized();

        var user = await _userManager.FindByIdAsync(staged.UserId.ToString());
        if (user == null) return Unauthorized();

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
        await _dbContext.SaveChangesAsync();

        var accessToken = await CreateAccessTokenAsync(user);

        return Ok(new LoginResponse(accessToken, newRtString));
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(LogoutRequest req)
    {
        var tokenHash = ComputeHash(req.RefreshToken);
        var rt = await _dbContext.Set<RefreshToken>().FirstOrDefaultAsync(r => r.TokenHash == tokenHash && r.UserId == Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)));
        if (rt == null) return NotFound();

        rt.RevokedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();

        return Ok();
    }

    [HttpPost("logout-all")]
    [Authorize]
    public async Task<IActionResult> LogoutAll()
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
        var tokens = await _dbContext.Set<RefreshToken>().Where(r => r.UserId == userId && r.RevokedAtUtc == null).ToListAsync();
        foreach (var t in tokens) t.RevokedAtUtc = DateTime.UtcNow;
        await _dbContext.SaveChangesAsync();
        return Ok();
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
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email ?? string.Empty)
        };

        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var token = new JwtSecurityToken(
            issuer: _jwtSettings.Issuer,
            audience: _jwtSettings.Audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(_jwtSettings.AccessTokenMinutes),
            signingCredentials: creds);

        return handler.WriteToken(token);
    }

}
