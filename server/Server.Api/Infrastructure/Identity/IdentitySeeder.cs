using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Server.Modules.Identity.Domain;

namespace Server.Api.Infrastructure.Identity;

public sealed class IdentitySeeder
{
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IOptions<SuperUserOptions> _options;
    private readonly ILogger<IdentitySeeder> _logger;

    public IdentitySeeder(
        RoleManager<ApplicationRole> roleManager,
        UserManager<ApplicationUser> userManager,
        IOptions<SuperUserOptions> options,
        ILogger<IdentitySeeder> logger)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _options = options;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        await EnsureRolesAsync();
        await EnsureSuperUserAsync();
    }

    private async Task EnsureRolesAsync()
    {
        var roles = new[] { "SuperUser", "Admin", "User" };

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                var result = await _roleManager.CreateAsync(new ApplicationRole { Name = role });
                if (!result.Succeeded)
                {
                    var errors = string.Join(",", result.Errors.Select(e => e.Description));
                    throw new InvalidOperationException($"Failed to create role {role}: {errors}");
                }

                _logger.LogInformation("Created role {Role}", role);
            }
        }
    }

    private async Task EnsureSuperUserAsync()
    {
        var email = _options.Value.Email;
        var password = _options.Value.Password;

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            _logger.LogWarning("SuperUser credentials are not configured; skipping SuperUser creation.");
            return;
        }

        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true
            };

            var result = await _userManager.CreateAsync(user, password);
            if (!result.Succeeded)
            {
                var errors = string.Join(",", result.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to create SuperUser: {errors}");
            }

            _logger.LogInformation("Created SuperUser {Email}", email);
        }

        if (!await _userManager.IsInRoleAsync(user, "SuperUser"))
        {
            var roleResult = await _userManager.AddToRoleAsync(user, "SuperUser");
            if (!roleResult.Succeeded)
            {
                var errors = string.Join(",", roleResult.Errors.Select(e => e.Description));
                throw new InvalidOperationException($"Failed to add SuperUser role: {errors}");
            }
        }
    }
}
