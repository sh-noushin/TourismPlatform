using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Server.Modules.Identity.Application.Services;
using Server.Modules.Identity.Contracts.Permissions.Dtos;
using Server.SharedKernel.Auth;

namespace Server.Api.Controllers;

[ApiController]
[Route("api/superuser")]
[Authorize(PolicyNames.SuperUserOnly)]
public class SuperUserPermissionsController : ControllerBase
{
    private readonly ISuperUserPermissionService _permissionService;

    public SuperUserPermissionsController(
        ISuperUserPermissionService permissionService)
    {
        _permissionService = permissionService;
    }

    [HttpGet("permission-definitions")]
    [ProducesResponseType(typeof(IEnumerable<PermissionDefinitionDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPermissionDefinitions()
    {
        var definitions = await _permissionService.GetPermissionDefinitionsAsync();
        return Ok(definitions);
    }

    [HttpGet("permission-definitions/{id:guid}")]
    [ProducesResponseType(typeof(PermissionDefinitionDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetPermissionDefinition(Guid id)
    {
        var dto = await _permissionService.GetPermissionDefinitionAsync(id);
        return dto == null ? NotFound() : Ok(dto);
    }

    [HttpPost("permission-definitions")]
    [ProducesResponseType(typeof(PermissionDefinitionDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> CreatePermissionDefinition(CreatePermissionDefinitionRequest request)
    {
        var result = await _permissionService.CreatePermissionDefinitionAsync(request);
        if (result.IsSuccess && result.Dto != null)
        {
            return CreatedAtAction(nameof(GetPermissionDefinition), new { id = result.Dto.PermissionId }, result.Dto);
        }

        return result.Error switch
        {
            PermissionCreateError.Conflict => Conflict(new { message = "Permission code already exists." }),
            _ => BadRequest(new { message = "Permission code must be provided." })
        };
    }

    [HttpPut("permission-definitions/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> UpdatePermissionDefinition(Guid id, UpdatePermissionDefinitionRequest request)
    {
        var updated = await _permissionService.UpdatePermissionDefinitionAsync(id, request);
        return updated ? NoContent() : NotFound();
    }

    [HttpDelete("permission-definitions/{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeletePermissionDefinition(Guid id)
    {
        var deleted = await _permissionService.DeletePermissionDefinitionAsync(id);
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("roles/{roleId:guid}/permissions/{permissionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AssignPermissionToRole(Guid roleId, Guid permissionId)
    {
        var result = await _permissionService.AssignPermissionToRoleAsync(roleId, permissionId);
        return result switch
        {
            PermissionAssignmentResult.Success => NoContent(),
            PermissionAssignmentResult.RoleNotFound => NotFound(new { message = "Role not found." }),
            PermissionAssignmentResult.PermissionNotFound => NotFound(new { message = "Permission not found." }),
            PermissionAssignmentResult.Conflict => Conflict(new { message = "Permission already assigned to role." }),
            _ => BadRequest()
        };
    }

    [HttpDelete("roles/{roleId:guid}/permissions/{permissionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RemovePermissionFromRole(Guid roleId, Guid permissionId)
    {
        var result = await _permissionService.RemovePermissionFromRoleAsync(roleId, permissionId);
        return result == PermissionRemoveResult.Success
            ? NoContent()
            : NotFound(new { message = "Role permission not found." });
    }

    [HttpPost("users/{userId:guid}/permissions/{permissionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> AssignPermissionToUser(Guid userId, Guid permissionId)
    {
        var result = await _permissionService.AssignPermissionToUserAsync(userId, permissionId);
        return result switch
        {
            PermissionAssignmentResult.Success => NoContent(),
            PermissionAssignmentResult.UserNotFound => NotFound(new { message = "User not found." }),
            PermissionAssignmentResult.PermissionNotFound => NotFound(new { message = "Permission not found." }),
            PermissionAssignmentResult.Conflict => Conflict(new { message = "Permission already assigned to user." }),
            _ => BadRequest()
        };
    }

    [HttpDelete("users/{userId:guid}/permissions/{permissionId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> RemovePermissionFromUser(Guid userId, Guid permissionId)
    {
        var result = await _permissionService.RemovePermissionFromUserAsync(userId, permissionId);
        return result == PermissionRemoveResult.Success
            ? NoContent()
            : NotFound(new { message = "User permission not found." });
    }
}
