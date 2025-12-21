using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;
using Server.Api.Infrastructure.Persistence;
using Server.Modules.Identity.Domain.Permissions;
using System.Security.Claims;

namespace Server.Api.Infrastructure.Security;

public sealed class PermissionAuthorizationHandler : AuthorizationHandler<PermissionRequirement>
{
    private readonly ApplicationDbContext _dbContext;
    private readonly IMemoryCache _cache;
    private readonly ILogger<PermissionAuthorizationHandler> _logger;

    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(2);

    public PermissionAuthorizationHandler(
        ApplicationDbContext dbContext,
        IMemoryCache cache,
        ILogger<PermissionAuthorizationHandler> logger)
    {
        _dbContext = dbContext;
        _cache = cache;
        _logger = logger;
    }

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PermissionRequirement requirement)
    {
        if (context.User?.Identity?.IsAuthenticated != true)
            return;

        if (context.User.IsInRole(Server.SharedKernel.Auth.Roles.SuperUser))
        {
            context.Succeed(requirement);
            return;
        }

        if (string.IsNullOrWhiteSpace(requirement.PermissionCode))
            return;

        var userIdValue = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!Guid.TryParse(userIdValue, out var userId))
            return;

        var cacheKey = $"permset:{userId:D}";

        if (!_cache.TryGetValue<HashSet<string>>(cacheKey, out var permissionSet))
        {
            permissionSet = await LoadUserPermissionSetAsync(context.User, userId);

            _cache.Set(cacheKey, permissionSet, CacheDuration);
        }

        if (permissionSet != null && permissionSet.Contains(requirement.PermissionCode))
        {
            context.Succeed(requirement);
        }
    }

    private async Task<HashSet<string>> LoadUserPermissionSetAsync(ClaimsPrincipal user, Guid userId)
    {
        var roleNames = user.FindAll(ClaimTypes.Role)
            .Select(c => c.Value)
            .Where(v => !string.IsNullOrWhiteSpace(v))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        var userPermissionCodes =
            from up in _dbContext.Set<UserPermission>().AsNoTracking()
            join p in _dbContext.Set<PermissionDefinition>().AsNoTracking()
                on up.PermissionId equals p.Id
            where up.UserId == userId && p.IsEnabled
            select p.Code;

        IQueryable<string> rolePermissionCodes;

        if (roleNames.Length == 0)
        {
            rolePermissionCodes = Enumerable.Empty<string>().AsQueryable();
        }
        else
        {
            rolePermissionCodes =
                from rp in _dbContext.Set<RolePermission>().AsNoTracking()
                join r in _dbContext.Roles.AsNoTracking()
                    on rp.RoleId equals r.Id
                join p in _dbContext.Set<PermissionDefinition>().AsNoTracking()
                    on rp.PermissionId equals p.Id
                where r.Name != null
                      && roleNames.Contains(r.Name)
                      && p.IsEnabled
                select p.Code;
        }

        var codes = await rolePermissionCodes
            .Union(userPermissionCodes)
            .Distinct()
            .ToListAsync();

        return new HashSet<string>(codes, StringComparer.OrdinalIgnoreCase);
    }
}
