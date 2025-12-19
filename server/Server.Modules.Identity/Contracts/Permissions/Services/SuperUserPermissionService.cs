using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Identity.Application.Services;
using Server.Modules.Identity.Contracts.Permissions.Dtos;
using Server.Modules.Identity.Domain.Permissions;
using Server.Modules.Identity.Domain.Roles;
using Server.Modules.Identity.Domain.Users;

namespace Server.Modules.Identity.Contracts.Permissions.Services;

public sealed class SuperUserPermissionService : ISuperUserPermissionService
{
    private readonly DbContext _dbContext;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public SuperUserPermissionService(
        DbContext dbContext,
        RoleManager<ApplicationRole> roleManager,
        UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    public async Task<IReadOnlyCollection<PermissionDefinitionDto>> GetPermissionDefinitionsAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<PermissionDefinition>()
            .OrderBy(p => p.Code)
            .Select(p => new PermissionDefinitionDto(p.Id, p.Code, p.Description, p.IsEnabled))
            .ToListAsync(cancellationToken);
    }

    public async Task<PermissionDefinitionDto?> GetPermissionDefinitionAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync([id], cancellationToken);
        if (permission == null) return null;

        return new PermissionDefinitionDto(permission.Id, permission.Code, permission.Description, permission.IsEnabled);
    }

    public async Task<CreatePermissionDefinitionResult> CreatePermissionDefinitionAsync(
        CreatePermissionDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return new CreatePermissionDefinitionResult(false, null, PermissionCreateError.Invalid);
        }

        var normalizedCode = request.Code.Trim();
        if (await _dbContext.Set<PermissionDefinition>().AnyAsync(p => p.Code == normalizedCode, cancellationToken))
        {
            return new CreatePermissionDefinitionResult(false, null, PermissionCreateError.Conflict);
        }

        var entity = new PermissionDefinition
        {
            Code = normalizedCode,
            Description = request.Description,
            IsEnabled = request.IsEnabled
        };

        _dbContext.Add(entity);
        await _dbContext.SaveChangesAsync(cancellationToken);

        var dto = new PermissionDefinitionDto(entity.Id, entity.Code, entity.Description, entity.IsEnabled);
        return new CreatePermissionDefinitionResult(true, dto, null);
    }

    public async Task<bool> UpdatePermissionDefinitionAsync(
        Guid id,
        UpdatePermissionDefinitionRequest request,
        CancellationToken cancellationToken = default)
    {
        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync([id], cancellationToken);
        if (permission == null) return false;

        permission.Description = request.Description;
        permission.IsEnabled = request.IsEnabled;

        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<bool> DeletePermissionDefinitionAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync([id], cancellationToken);
        if (permission == null) return false;

        _dbContext.Remove(permission);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<PermissionAssignmentResult> AssignPermissionToRoleAsync(Guid roleId, Guid permissionId, CancellationToken cancellationToken = default)
    {
        var role = await _roleManager.FindByIdAsync(roleId.ToString());
        if (role == null) return PermissionAssignmentResult.RoleNotFound;

        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync([permissionId], cancellationToken);
        if (permission == null) return PermissionAssignmentResult.PermissionNotFound;

        var alreadyAssigned = await _dbContext.Set<RolePermission>()
            .AnyAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId, cancellationToken);

        if (alreadyAssigned) return PermissionAssignmentResult.Conflict;

        _dbContext.Add(new RolePermission { RoleId = roleId, PermissionId = permissionId });
        await _dbContext.SaveChangesAsync(cancellationToken);
        return PermissionAssignmentResult.Success;
    }

    public async Task<PermissionRemoveResult> RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId, CancellationToken cancellationToken = default)
    {
        var assignment = await _dbContext.Set<RolePermission>()
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId, cancellationToken);

        if (assignment == null) return PermissionRemoveResult.NotFound;

        _dbContext.Remove(assignment);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return PermissionRemoveResult.Success;
    }

    public async Task<PermissionAssignmentResult> AssignPermissionToUserAsync(Guid userId, Guid permissionId, CancellationToken cancellationToken = default)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return PermissionAssignmentResult.UserNotFound;

        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync([permissionId], cancellationToken);
        if (permission == null) return PermissionAssignmentResult.PermissionNotFound;

        var alreadyAssigned = await _dbContext.Set<UserPermission>()
            .AnyAsync(up => up.UserId == userId && up.PermissionId == permissionId, cancellationToken);

        if (alreadyAssigned) return PermissionAssignmentResult.Conflict;

        _dbContext.Add(new UserPermission { UserId = userId, PermissionId = permissionId });
        await _dbContext.SaveChangesAsync(cancellationToken);
        return PermissionAssignmentResult.Success;
    }

    public async Task<PermissionRemoveResult> RemovePermissionFromUserAsync(Guid userId, Guid permissionId, CancellationToken cancellationToken = default)
    {
        var assignment = await _dbContext.Set<UserPermission>()
            .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permissionId, cancellationToken);

        if (assignment == null) return PermissionRemoveResult.NotFound;

        _dbContext.Remove(assignment);
        await _dbContext.SaveChangesAsync(cancellationToken);
        return PermissionRemoveResult.Success;
    }
}
