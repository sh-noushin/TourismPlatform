using Microsoft.AspNetCore.Identity;
using Moq;
using Server.Api.Infrastructure.Security;
using Server.Api.Services;
using Server.Modules.Identity.Contracts.Auth.Dtos;
using Server.Modules.Identity.Domain.RefreshTokens;
using Server.Modules.Identity.Domain.Roles;
using Server.Modules.Identity.Domain.Users;
using Server.SharedKernel.Auth;
using Server.Tests.Common;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using System.Text;

namespace Server.Tests.Modules.Api;

public sealed class AuthServiceCoverageTests
{
    private static JwtSettings CreateJwtSettings() => new JwtSettings
    {
        Issuer = "issuer",
        Audience = "audience",
        Key = "THIS_IS_A_TEST_KEY_WITH_ENOUGH_LENGTH_1234567890",
        AccessTokenMinutes = 5
    };

    private static string ComputeHash(string token)
    {
        using var sha = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(token);
        return Convert.ToBase64String(sha.ComputeHash(bytes));
    }

    private static void SeedUser(TestDb db, Guid userId, string email = "a@b.com")
    {
        var normalized = email.ToUpperInvariant();
        db.Context.Add(new ApplicationUser
        {
            Id = userId,
            Email = email,
            NormalizedEmail = normalized,
            UserName = email,
            NormalizedUserName = normalized,
            EmailConfirmed = true
        });
    }

    [Fact]
    public async Task RegisterAsync_ReturnsConflict_WhenUserAlreadyExists()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        userManager.Setup(m => m.FindByEmailAsync("a@b.com"))
            .ReturnsAsync(new ApplicationUser { Id = Guid.NewGuid(), Email = "a@b.com", UserName = "a@b.com" });

        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, CreateJwtSettings());

        var result = await service.RegisterAsync(new RegisterRequest("a@b.com", "Password123!"));

        Assert.Equal(AuthResult.Conflict, result);
        userManager.Verify(m => m.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task RegisterAsync_ReturnsInvalid_WhenCreateFails()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        userManager.Setup(m => m.FindByEmailAsync("a@b.com"))
            .ReturnsAsync((ApplicationUser?)null);

        userManager.Setup(m => m.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Failed(new IdentityError { Code = "X" }));

        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, CreateJwtSettings());

        var result = await service.RegisterAsync(new RegisterRequest("a@b.com", "Password123!"));

        Assert.Equal(AuthResult.Invalid, result);
    }

    [Fact]
    public async Task RegisterAsync_CreatesRoleIfMissing_AndAddsUserToRole()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        userManager.Setup(m => m.FindByEmailAsync("a@b.com"))
            .ReturnsAsync((ApplicationUser?)null);

        userManager.Setup(m => m.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);

        roleManager.Setup(m => m.RoleExistsAsync(Roles.User))
            .ReturnsAsync(false);

        roleManager.Setup(m => m.CreateAsync(It.IsAny<ApplicationRole>()))
            .ReturnsAsync(IdentityResult.Success);

        userManager.Setup(m => m.AddToRoleAsync(It.IsAny<ApplicationUser>(), Roles.User))
            .ReturnsAsync(IdentityResult.Success);

        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, CreateJwtSettings());

        var result = await service.RegisterAsync(new RegisterRequest("a@b.com", "Password123!"));

        Assert.Equal(AuthResult.Success, result);
        roleManager.Verify(m => m.CreateAsync(It.Is<ApplicationRole>(r => r.Name == Roles.User)), Times.Once);
        userManager.Verify(m => m.AddToRoleAsync(It.IsAny<ApplicationUser>(), Roles.User), Times.Once);
    }

    [Fact]
    public async Task RegisterAsync_SkipsRoleCreation_WhenRoleExists()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        userManager.Setup(m => m.FindByEmailAsync("a@b.com"))
            .ReturnsAsync((ApplicationUser?)null);

        userManager.Setup(m => m.CreateAsync(It.IsAny<ApplicationUser>(), It.IsAny<string>()))
            .ReturnsAsync(IdentityResult.Success);

        roleManager.Setup(m => m.RoleExistsAsync(Roles.User))
            .ReturnsAsync(true);

        userManager.Setup(m => m.AddToRoleAsync(It.IsAny<ApplicationUser>(), Roles.User))
            .ReturnsAsync(IdentityResult.Success);

        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, CreateJwtSettings());

        var result = await service.RegisterAsync(new RegisterRequest("a@b.com", "Password123!"));

        Assert.Equal(AuthResult.Success, result);
        roleManager.Verify(m => m.CreateAsync(It.IsAny<ApplicationRole>()), Times.Never);
    }

    [Fact]
    public async Task LoginAsync_ReturnsNull_WhenUserMissingOrPasswordInvalid()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        userManager.Setup(m => m.FindByEmailAsync("a@b.com"))
            .ReturnsAsync((ApplicationUser?)null);

        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, CreateJwtSettings());

        Assert.Null(await service.LoginAsync(new LoginRequest("a@b.com", "pw")));

        var user = new ApplicationUser { Id = Guid.NewGuid(), Email = "a@b.com", UserName = "a@b.com" };
        userManager.Setup(m => m.FindByEmailAsync("a@b.com"))
            .ReturnsAsync(user);
        userManager.Setup(m => m.CheckPasswordAsync(user, "pw"))
            .ReturnsAsync(false);

        Assert.Null(await service.LoginAsync(new LoginRequest("a@b.com", "pw")));
    }

    [Fact]
    public async Task LoginAsync_Success_PersistsRefreshToken_AndReturnsJwt()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        var user = new ApplicationUser { Id = Guid.NewGuid(), Email = "a@b.com", UserName = "a@b.com", EmailConfirmed = true };

        // RefreshToken has an FK to the user table; seed the user so SaveChanges succeeds.
        SeedUser(db, user.Id, user.Email!);
        await db.Context.SaveChangesAsync();

        userManager.Setup(m => m.FindByEmailAsync("a@b.com"))
            .ReturnsAsync(user);

        userManager.Setup(m => m.CheckPasswordAsync(user, "pw"))
            .ReturnsAsync(true);

        userManager.Setup(m => m.GetRolesAsync(user))
            .ReturnsAsync(new[] { Roles.User });

        var jwt = CreateJwtSettings();
        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, jwt);

        var response = await service.LoginAsync(new LoginRequest("a@b.com", "pw"));

        Assert.NotNull(response);
        Assert.False(string.IsNullOrWhiteSpace(response!.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(response.RefreshToken));

        var token = new JwtSecurityTokenHandler().ReadJwtToken(response.AccessToken);
        Assert.Equal(jwt.Issuer, token.Issuer);
        Assert.Equal(jwt.Audience, token.Audiences.Single());

        Assert.Contains(token.Claims, c => c.Type == System.Security.Claims.ClaimTypes.NameIdentifier && c.Value == user.Id.ToString());
        Assert.Contains(token.Claims, c => c.Type == System.Security.Claims.ClaimTypes.Email && c.Value == user.Email);
        Assert.Contains(token.Claims, c => c.Type == System.Security.Claims.ClaimTypes.Role && c.Value == Roles.User);

        var rt = db.Context.Set<RefreshToken>().Single();
        Assert.Equal(user.Id, rt.UserId);
        Assert.Equal(ComputeHash(response.RefreshToken), rt.TokenHash);
        Assert.Null(rt.RevokedAtUtc);
    }

    [Fact]
    public async Task RefreshAsync_ReturnsNull_ForMissingRevokedExpiredOrUserMissing()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, CreateJwtSettings());

        Assert.Null(await service.RefreshAsync(new RefreshRequest("missing")));

        var revokedToken = "revoked";
        var revokedUserId = Guid.NewGuid();
        SeedUser(db, revokedUserId, "revoked@b.com");
        db.Context.Add(new RefreshToken
        {
            RefreshTokenId = Guid.NewGuid(),
            UserId = revokedUserId,
            TokenHash = ComputeHash(revokedToken),
            CreatedAtUtc = DateTime.UtcNow.AddDays(-1),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(1),
            RevokedAtUtc = DateTime.UtcNow
        });

        var expiredToken = "expired";
        var expiredUserId = Guid.NewGuid();
        SeedUser(db, expiredUserId, "expired@b.com");
        db.Context.Add(new RefreshToken
        {
            RefreshTokenId = Guid.NewGuid(),
            UserId = expiredUserId,
            TokenHash = ComputeHash(expiredToken),
            CreatedAtUtc = DateTime.UtcNow.AddDays(-10),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(-1)
        });

        var userMissingToken = "usermissing";
        var userMissingId = Guid.NewGuid();
        // Seed the user for FK purposes, but mock the UserManager to return null to hit the "user missing" branch.
        SeedUser(db, userMissingId, "missing@b.com");
        db.Context.Add(new RefreshToken
        {
            RefreshTokenId = Guid.NewGuid(),
            UserId = userMissingId,
            TokenHash = ComputeHash(userMissingToken),
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(1)
        });

        await db.Context.SaveChangesAsync();

        Assert.Null(await service.RefreshAsync(new RefreshRequest(revokedToken)));
        Assert.Null(await service.RefreshAsync(new RefreshRequest(expiredToken)));

        userManager.Setup(m => m.FindByIdAsync(userMissingId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        Assert.Null(await service.RefreshAsync(new RefreshRequest(userMissingToken)));
    }

    [Fact]
    public async Task RefreshAsync_Success_RevokesOldAndIssuesNew()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        var userId = Guid.NewGuid();
        var user = new ApplicationUser { Id = userId, Email = "a@b.com", UserName = "a@b.com", EmailConfirmed = true };

        SeedUser(db, userId, user.Email!);

        var oldRefresh = "old-token";
        var old = new RefreshToken
        {
            RefreshTokenId = Guid.NewGuid(),
            UserId = userId,
            TokenHash = ComputeHash(oldRefresh),
            CreatedAtUtc = DateTime.UtcNow.AddMinutes(-1),
            ExpiresAtUtc = DateTime.UtcNow.AddDays(1)
        };

        db.Context.Add(old);
        await db.Context.SaveChangesAsync();

        userManager.Setup(m => m.FindByIdAsync(userId.ToString())).ReturnsAsync(user);
        userManager.Setup(m => m.GetRolesAsync(user)).ReturnsAsync(new[] { Roles.User });

        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, CreateJwtSettings());

        var response = await service.RefreshAsync(new RefreshRequest(oldRefresh));

        Assert.NotNull(response);
        Assert.NotEqual(oldRefresh, response!.RefreshToken);

        var oldRow = await db.Context.Set<RefreshToken>().FindAsync(old.RefreshTokenId);
        Assert.NotNull(oldRow);
        Assert.NotNull(oldRow!.RevokedAtUtc);
        Assert.NotNull(oldRow.ReplacedByRefreshTokenId);

        var all = db.Context.Set<RefreshToken>().ToList();
        Assert.Equal(2, all.Count);
        Assert.Contains(all, x => x.RefreshTokenId == old.RefreshTokenId);
        Assert.Contains(all, x => x.RefreshTokenId == oldRow.ReplacedByRefreshTokenId);
    }

    [Fact]
    public async Task LogoutAsync_ReturnsFalseWhenMissing_TrueWhenRevoked()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        var userId = Guid.NewGuid();
        SeedUser(db, userId, "logout@b.com");
        await db.Context.SaveChangesAsync();
        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, CreateJwtSettings());

        Assert.False(await service.LogoutAsync(userId, new LogoutRequest("missing")));

        var token = "t";
        var rt = new RefreshToken
        {
            RefreshTokenId = Guid.NewGuid(),
            UserId = userId,
            TokenHash = ComputeHash(token),
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(1)
        };

        db.Context.Add(rt);
        await db.Context.SaveChangesAsync();

        Assert.True(await service.LogoutAsync(userId, new LogoutRequest(token)));

        var updated = await db.Context.Set<RefreshToken>().FindAsync(rt.RefreshTokenId);
        Assert.NotNull(updated!.RevokedAtUtc);
    }

    [Fact]
    public async Task LogoutAllAsync_RevokesAllActiveTokensForUserOnly()
    {
        await using var db = new TestDb();

        var userManager = IdentityMocks.CreateUserManager();
        var roleManager = IdentityMocks.CreateRoleManager();

        var userId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();

        SeedUser(db, userId, "user@b.com");
        SeedUser(db, otherUserId, "other@b.com");

        var active1 = new RefreshToken { RefreshTokenId = Guid.NewGuid(), UserId = userId, TokenHash = "h1", CreatedAtUtc = DateTime.UtcNow, ExpiresAtUtc = DateTime.UtcNow.AddDays(1) };
        var active2 = new RefreshToken { RefreshTokenId = Guid.NewGuid(), UserId = userId, TokenHash = "h2", CreatedAtUtc = DateTime.UtcNow, ExpiresAtUtc = DateTime.UtcNow.AddDays(1) };
        var alreadyRevoked = new RefreshToken { RefreshTokenId = Guid.NewGuid(), UserId = userId, TokenHash = "h3", CreatedAtUtc = DateTime.UtcNow, ExpiresAtUtc = DateTime.UtcNow.AddDays(1), RevokedAtUtc = DateTime.UtcNow };
        var otherUserActive = new RefreshToken { RefreshTokenId = Guid.NewGuid(), UserId = otherUserId, TokenHash = "h4", CreatedAtUtc = DateTime.UtcNow, ExpiresAtUtc = DateTime.UtcNow.AddDays(1) };

        db.Context.AddRange(active1, active2, alreadyRevoked, otherUserActive);
        await db.Context.SaveChangesAsync();

        var service = new AuthService(userManager.Object, roleManager.Object, db.Context, CreateJwtSettings());

        await service.LogoutAllAsync(userId);

        var updated = db.Context.Set<RefreshToken>().ToList();
        Assert.NotNull(updated.Single(x => x.RefreshTokenId == active1.RefreshTokenId).RevokedAtUtc);
        Assert.NotNull(updated.Single(x => x.RefreshTokenId == active2.RefreshTokenId).RevokedAtUtc);
        Assert.NotNull(updated.Single(x => x.RefreshTokenId == alreadyRevoked.RefreshTokenId).RevokedAtUtc);
        Assert.Null(updated.Single(x => x.RefreshTokenId == otherUserActive.RefreshTokenId).RevokedAtUtc);
    }
}
