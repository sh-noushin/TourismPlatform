using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Server.Api.Infrastructure.Persistence;
using Server.Modules.Identity.Contracts.Permissions;
using Server.Modules.Identity.Domain.Permissions;
using Server.Modules.Identity.Domain.Roles;
using Server.Modules.Identity.Domain.Users;
using Server.SharedKernel.Auth;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/superuser")]
[Authorize(PolicyNames.SuperUserOnly)]
public class SuperUserPermissionsController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;
    private readonly RoleManager<ApplicationRole> _roleManager;
    private readonly UserManager<ApplicationUser> _userManager;

    public SuperUserPermissionsController(
        ApplicationDbContext dbContext,
        RoleManager<ApplicationRole> roleManager,
        UserManager<ApplicationUser> userManager)
    {
        _dbContext = dbContext;
        _roleManager = roleManager;
        _userManager = userManager;
    }

    [HttpGet("permission-definitions")]
    public async Task<IActionResult> GetPermissionDefinitions()
    {
        var definitions = await _dbContext.Set<PermissionDefinition>()
            .OrderBy(p => p.Code)
            .Select(p => new PermissionDefinitionDto(p.Id, p.Code, p.Description, p.IsEnabled))
            .ToListAsync();

        return Ok(definitions);
    }

    [HttpGet("permission-definitions/{id:guid}")]
    public async Task<IActionResult> GetPermissionDefinition(Guid id)
    {
        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync(id);
        if (permission == null) return NotFound();

        var dto = new PermissionDefinitionDto(permission.Id, permission.Code, permission.Description, permission.IsEnabled);
        return Ok(dto);
    }

    [HttpPost("permission-definitions")]
    public async Task<IActionResult> CreatePermissionDefinition(CreatePermissionDefinitionRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Code))
        {
            return BadRequest(new { message = "Permission code must be provided." });
        }

        var normalizedCode = request.Code.Trim();
        if (await _dbContext.Set<PermissionDefinition>().AnyAsync(p => p.Code == normalizedCode))
        {
            return Conflict(new { message = "Permission code already exists." });
        }

        var entity = new PermissionDefinition
        {
            Code = normalizedCode,
            Description = request.Description,
            IsEnabled = request.IsEnabled
        };

        _dbContext.Add(entity);
        await _dbContext.SaveChangesAsync();

        var dto = new PermissionDefinitionDto(entity.Id, entity.Code, entity.Description, entity.IsEnabled);
        return CreatedAtAction(nameof(GetPermissionDefinition), new { id = entity.Id }, dto);
    }

    [HttpPut("permission-definitions/{id:guid}")]
    public async Task<IActionResult> UpdatePermissionDefinition(Guid id, UpdatePermissionDefinitionRequest request)
    {
        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync(id);
        if (permission == null) return NotFound();

        permission.Description = request.Description;
        permission.IsEnabled = request.IsEnabled;

        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("permission-definitions/{id:guid}")]
    public async Task<IActionResult> DeletePermissionDefinition(Guid id)
    {
        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync(id);
        if (permission == null) return NotFound();

        _dbContext.Remove(permission);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("roles/{roleId:guid}/permissions/{permissionId:guid}")]
    public async Task<IActionResult> AssignPermissionToRole(Guid roleId, Guid permissionId)
    {
        var role = await _roleManager.FindByIdAsync(roleId.ToString());
        if (role == null) return NotFound(new { message = "Role not found." });

        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync(permissionId);
        if (permission == null) return NotFound(new { message = "Permission not found." });

        var alreadyAssigned = await _dbContext.Set<RolePermission>()
            .AnyAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (alreadyAssigned) return Conflict(new { message = "Permission already assigned to role." });

        _dbContext.Add(new RolePermission { RoleId = roleId, PermissionId = permissionId });
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("roles/{roleId:guid}/permissions/{permissionId:guid}")]
    public async Task<IActionResult> RemovePermissionFromRole(Guid roleId, Guid permissionId)
    {
        var assignment = await _dbContext.Set<RolePermission>()
            .FirstOrDefaultAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        if (assignment == null) return NotFound(new { message = "Role permission not found." });

        _dbContext.Remove(assignment);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("users/{userId:guid}/permissions/{permissionId:guid}")]
    public async Task<IActionResult> AssignPermissionToUser(Guid userId, Guid permissionId)
    {
        var user = await _userManager.FindByIdAsync(userId.ToString());
        if (user == null) return NotFound(new { message = "User not found." });

        var permission = await _dbContext.Set<PermissionDefinition>().FindAsync(permissionId);
        if (permission == null) return NotFound(new { message = "Permission not found." });

        var alreadyAssigned = await _dbContext.Set<UserPermission>()
            .AnyAsync(up => up.UserId == userId && up.PermissionId == permissionId);

        if (alreadyAssigned) return Conflict(new { message = "Permission already assigned to user." });

        _dbContext.Add(new UserPermission { UserId = userId, PermissionId = permissionId });
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("users/{userId:guid}/permissions/{permissionId:guid}")]
    public async Task<IActionResult> RemovePermissionFromUser(Guid userId, Guid permissionId)
    {
        var assignment = await _dbContext.Set<UserPermission>()
            .FirstOrDefaultAsync(up => up.UserId == userId && up.PermissionId == permissionId);

        if (assignment == null) return NotFound(new { message = "User permission not found." });

        _dbContext.Remove(assignment);
        await _dbContext.SaveChangesAsync();
        return NoContent();
    }
}
