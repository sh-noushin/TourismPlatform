using Server.Modules.Identity.Contracts.Permissions.Dtos;

namespace Server.Modules.Identity.Application.Services;

public interface ISuperUserPermissionService
{
    Task<IReadOnlyCollection<PermissionDefinitionDto>> GetPermissionDefinitionsAsync(CancellationToken cancellationToken = default);

    Task<PermissionDefinitionDto?> GetPermissionDefinitionAsync(Guid id, CancellationToken cancellationToken = default);

    Task<CreatePermissionDefinitionResult> CreatePermissionDefinitionAsync(
        CreatePermissionDefinitionRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> UpdatePermissionDefinitionAsync(
        Guid id,
        UpdatePermissionDefinitionRequest request,
        CancellationToken cancellationToken = default);

    Task<bool> DeletePermissionDefinitionAsync(Guid id, CancellationToken cancellationToken = default);

    Task<PermissionAssignmentResult> AssignPermissionToRoleAsync(Guid roleId, Guid permissionId, CancellationToken cancellationToken = default);

    Task<PermissionRemoveResult> RemovePermissionFromRoleAsync(Guid roleId, Guid permissionId, CancellationToken cancellationToken = default);

    Task<PermissionAssignmentResult> AssignPermissionToUserAsync(Guid userId, Guid permissionId, CancellationToken cancellationToken = default);

    Task<PermissionRemoveResult> RemovePermissionFromUserAsync(Guid userId, Guid permissionId, CancellationToken cancellationToken = default);
}

public sealed record CreatePermissionDefinitionResult(
    bool IsSuccess,
    PermissionDefinitionDto? Dto,
    PermissionCreateError? Error);

public enum PermissionCreateError
{
    Invalid = 0,
    Conflict = 1
}

public enum PermissionAssignmentResult
{
    Success = 0,
    RoleNotFound = 1,
    UserNotFound = 2,
    PermissionNotFound = 3,
    Conflict = 4
}

public enum PermissionRemoveResult
{
    Success = 0,
    NotFound = 1
}
