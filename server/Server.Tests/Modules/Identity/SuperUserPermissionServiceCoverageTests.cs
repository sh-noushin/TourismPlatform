using Microsoft.EntityFrameworkCore;
using Moq;
using Server.Modules.Identity.Application.Services;
using Server.Modules.Identity.Contracts.Permissions.Dtos;
using Server.Modules.Identity.Contracts.Permissions.Services;
using Server.Modules.Identity.Domain.Permissions;
using Server.Modules.Identity.Domain.Roles;
using Server.Modules.Identity.Domain.Users;
using Server.Tests.Common;

namespace Server.Tests.Modules.Identity;

public sealed class SuperUserPermissionServiceCoverageTests
{
    [Fact]
    public async Task GetPermissionDefinitionsAsync_ReturnsOrderedList()
    {
        await using var db = new TestDb();

        var p1 = new PermissionDefinition { Code = "B", Description = "b", IsEnabled = true };
        var p2 = new PermissionDefinition { Code = "A", Description = "a", IsEnabled = false };
        db.Context.AddRange(p1, p2);

        await db.Context.SaveChangesAsync();

        var service = new SuperUserPermissionService(db.Context, IdentityMocks.CreateRoleManager().Object, IdentityMocks.CreateUserManager().Object);
        var list = await service.GetPermissionDefinitionsAsync();

        Assert.Equal(new[] { "A", "B" }, list.Select(x => x.Code).ToArray());
    }

    [Fact]
    public async Task GetPermissionDefinitionAsync_ReturnsNullWhenMissing()
    {
        await using var db = new TestDb();

        var service = new SuperUserPermissionService(db.Context, IdentityMocks.CreateRoleManager().Object, IdentityMocks.CreateUserManager().Object);
        Assert.Null(await service.GetPermissionDefinitionAsync(Guid.NewGuid()));
    }

    [Fact]
    public async Task GetPermissionDefinitionAsync_ReturnsDtoWhenFound()
    {
        await using var db = new TestDb();

        var permission = new PermissionDefinition { Code = "X", Description = "d", IsEnabled = true };
        db.Context.Add(permission);
        await db.Context.SaveChangesAsync();

        var service = new SuperUserPermissionService(db.Context, IdentityMocks.CreateRoleManager().Object, IdentityMocks.CreateUserManager().Object);
        var dto = await service.GetPermissionDefinitionAsync(permission.Id);

        Assert.NotNull(dto);
        Assert.Equal(permission.Id, dto!.PermissionId);
        Assert.Equal("X", dto.Code);
    }

    [Fact]
    public async Task CreatePermissionDefinitionAsync_RejectsBlankCode()
    {
        await using var db = new TestDb();

        var service = new SuperUserPermissionService(db.Context, IdentityMocks.CreateRoleManager().Object, IdentityMocks.CreateUserManager().Object);
        var result = await service.CreatePermissionDefinitionAsync(new CreatePermissionDefinitionRequest(" ", "x", true));

        Assert.False(result.IsSuccess);
        Assert.Equal(PermissionCreateError.Invalid, result.Error);
    }

    [Fact]
    public async Task UpdatePermissionDefinitionAsync_ReturnsFalseWhenMissing_TrueWhenUpdated()
    {
        await using var db = new TestDb();

        var service = new SuperUserPermissionService(db.Context, IdentityMocks.CreateRoleManager().Object, IdentityMocks.CreateUserManager().Object);

        Assert.False(await service.UpdatePermissionDefinitionAsync(Guid.NewGuid(), new UpdatePermissionDefinitionRequest("d", false)));

        var entity = new PermissionDefinition { Code = "X", Description = "old", IsEnabled = true };
        db.Context.Add(entity);
        await db.Context.SaveChangesAsync();

        Assert.True(await service.UpdatePermissionDefinitionAsync(entity.Id, new UpdatePermissionDefinitionRequest("new", false)));

        var updated = await db.Context.Set<PermissionDefinition>().FindAsync(entity.Id);
        Assert.Equal("new", updated!.Description);
        Assert.False(updated.IsEnabled);
    }

    [Fact]
    public async Task DeletePermissionDefinitionAsync_ReturnsFalseWhenMissing_TrueWhenDeleted()
    {
        await using var db = new TestDb();

        var service = new SuperUserPermissionService(db.Context, IdentityMocks.CreateRoleManager().Object, IdentityMocks.CreateUserManager().Object);

        Assert.False(await service.DeletePermissionDefinitionAsync(Guid.NewGuid()));

        var entity = new PermissionDefinition { Code = "X", Description = "old", IsEnabled = true };
        db.Context.Add(entity);
        await db.Context.SaveChangesAsync();

        Assert.True(await service.DeletePermissionDefinitionAsync(entity.Id));
        Assert.False(await db.Context.Set<PermissionDefinition>().AnyAsync(x => x.Id == entity.Id));
    }

    [Fact]
    public async Task AssignPermissionToRoleAsync_ReturnsRoleNotFoundWhenMissing()
    {
        await using var db = new TestDb();

        var roleManager = IdentityMocks.CreateRoleManager();
        roleManager.Setup(r => r.FindByIdAsync(It.IsAny<string>())).ReturnsAsync((ApplicationRole?)null);

        var service = new SuperUserPermissionService(db.Context, roleManager.Object, IdentityMocks.CreateUserManager().Object);

        var result = await service.AssignPermissionToRoleAsync(Guid.NewGuid(), Guid.NewGuid());
        Assert.Equal(PermissionAssignmentResult.RoleNotFound, result);
    }

    [Fact]
    public async Task AssignPermissionToRoleAsync_ReturnsPermissionNotFoundWhenMissing()
    {
        await using var db = new TestDb();

        var roleId = Guid.NewGuid();
        db.Context.Add(new ApplicationRole { Id = roleId, Name = "Admin", NormalizedName = "ADMIN" });
        await db.Context.SaveChangesAsync();

        var roleManager = IdentityMocks.CreateRoleManager();
        roleManager.Setup(r => r.FindByIdAsync(roleId.ToString())).ReturnsAsync(new ApplicationRole { Id = roleId, Name = "Admin" });

        var service = new SuperUserPermissionService(db.Context, roleManager.Object, IdentityMocks.CreateUserManager().Object);

        var result = await service.AssignPermissionToRoleAsync(roleId, Guid.NewGuid());
        Assert.Equal(PermissionAssignmentResult.PermissionNotFound, result);
    }

    [Fact]
    public async Task AssignPermissionToRoleAsync_ReturnsConflictWhenAlreadyAssigned()
    {
        await using var db = new TestDb();

        var roleId = Guid.NewGuid();
        db.Context.Add(new ApplicationRole { Id = roleId, Name = "Admin", NormalizedName = "ADMIN" });

        var permission = new PermissionDefinition { Code = "X", Description = "d", IsEnabled = true };
        db.Context.Add(permission);
        db.Context.Add(new RolePermission { RoleId = roleId, PermissionId = permission.Id });
        await db.Context.SaveChangesAsync();

        var roleManager = IdentityMocks.CreateRoleManager();
        roleManager.Setup(r => r.FindByIdAsync(roleId.ToString())).ReturnsAsync(new ApplicationRole { Id = roleId, Name = "Admin" });

        var service = new SuperUserPermissionService(db.Context, roleManager.Object, IdentityMocks.CreateUserManager().Object);

        var result = await service.AssignPermissionToRoleAsync(roleId, permission.Id);
        Assert.Equal(PermissionAssignmentResult.Conflict, result);
    }

    [Fact]
    public async Task RemovePermissionFromRoleAsync_ReturnsNotFoundOrSuccess()
    {
        await using var db = new TestDb();

        var service = new SuperUserPermissionService(db.Context, IdentityMocks.CreateRoleManager().Object, IdentityMocks.CreateUserManager().Object);

        Assert.Equal(PermissionRemoveResult.NotFound, await service.RemovePermissionFromRoleAsync(Guid.NewGuid(), Guid.NewGuid()));

        var roleId = Guid.NewGuid();
        db.Context.Add(new ApplicationRole { Id = roleId, Name = "Admin", NormalizedName = "ADMIN" });
        var permission = new PermissionDefinition { Code = "X", IsEnabled = true };
        db.Context.Add(permission);
        db.Context.Add(new RolePermission { RoleId = roleId, PermissionId = permission.Id });
        await db.Context.SaveChangesAsync();

        Assert.Equal(PermissionRemoveResult.Success, await service.RemovePermissionFromRoleAsync(roleId, permission.Id));
        Assert.False(await db.Context.Set<RolePermission>().AnyAsync(x => x.RoleId == roleId && x.PermissionId == permission.Id));
    }

    [Fact]
    public async Task AssignPermissionToUserAsync_UserNotFound_PermissionNotFound_Conflict_Success()
    {
        await using var db = new TestDb();

        var userId = Guid.NewGuid();
        var permissionId = Guid.NewGuid();

        var userManager = IdentityMocks.CreateUserManager();
        userManager.Setup(u => u.FindByIdAsync(userId.ToString())).ReturnsAsync((ApplicationUser?)null);

        var service = new SuperUserPermissionService(db.Context, IdentityMocks.CreateRoleManager().Object, userManager.Object);

        Assert.Equal(PermissionAssignmentResult.UserNotFound, await service.AssignPermissionToUserAsync(userId, permissionId));

        var user = new ApplicationUser { Id = userId, Email = "a@b.com", UserName = "a@b.com", EmailConfirmed = true };
        db.Context.Add(user);
        await db.Context.SaveChangesAsync();

        userManager.Setup(u => u.FindByIdAsync(userId.ToString())).ReturnsAsync(user);

        Assert.Equal(PermissionAssignmentResult.PermissionNotFound, await service.AssignPermissionToUserAsync(userId, permissionId));

        var permission = new PermissionDefinition { Code = "X", IsEnabled = true };
        db.Context.Add(permission);
        await db.Context.SaveChangesAsync();

        Assert.Equal(PermissionAssignmentResult.Success, await service.AssignPermissionToUserAsync(userId, permission.Id));
        Assert.Equal(PermissionAssignmentResult.Conflict, await service.AssignPermissionToUserAsync(userId, permission.Id));
    }

    [Fact]
    public async Task RemovePermissionFromUserAsync_ReturnsNotFoundOrSuccess()
    {
        await using var db = new TestDb();

        var userId = Guid.NewGuid();
        var user = new ApplicationUser { Id = userId, Email = "a@b.com", UserName = "a@b.com", EmailConfirmed = true };
        db.Context.Add(user);
        var permission = new PermissionDefinition { Code = "X", IsEnabled = true };
        db.Context.Add(permission);
        await db.Context.SaveChangesAsync();

        var service = new SuperUserPermissionService(db.Context, IdentityMocks.CreateRoleManager().Object, IdentityMocks.CreateUserManager().Object);

        Assert.Equal(PermissionRemoveResult.NotFound, await service.RemovePermissionFromUserAsync(userId, permission.Id));

        db.Context.Add(new UserPermission { UserId = userId, PermissionId = permission.Id });
        await db.Context.SaveChangesAsync();

        Assert.Equal(PermissionRemoveResult.Success, await service.RemovePermissionFromUserAsync(userId, permission.Id));
        Assert.False(await db.Context.Set<UserPermission>().AnyAsync(x => x.UserId == userId && x.PermissionId == permission.Id));
    }
}
