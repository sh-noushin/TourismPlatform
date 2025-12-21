using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Moq;
using Server.Modules.Identity.Application.Services;
using Server.Modules.Identity.Contracts.Permissions.Dtos;
using Server.Modules.Identity.Contracts.Permissions.Services;
using Server.Modules.Identity.Domain.Permissions;
using Server.Modules.Identity.Domain.Roles;
using Server.Modules.Identity.Domain.Users;
using Server.Tests.Common;
using Xunit;

namespace Server.Tests.Modules.Identity;

public sealed class SuperUserPermissionServiceTests
{
    [Fact]
    public async Task CreatePermissionDefinitionAsync_PersistsAndPreventsDuplicates()
    {
        await using var db = new TestDb();

        var roleManager = IdentityMocks.CreateRoleManager();
        var userManager = IdentityMocks.CreateUserManager();

        var service = new SuperUserPermissionService(db.Context, roleManager.Object, userManager.Object);

        var created = await service.CreatePermissionDefinitionAsync(
            new CreatePermissionDefinitionRequest("ToursManage", "Manage tours", true));

        Assert.True(created.IsSuccess);
        Assert.NotNull(created.Dto);

        var duplicate = await service.CreatePermissionDefinitionAsync(
            new CreatePermissionDefinitionRequest("ToursManage", "Dup", true));

        Assert.False(duplicate.IsSuccess);
        Assert.Equal(PermissionCreateError.Conflict, duplicate.Error);

        var count = await db.Context.Set<PermissionDefinition>().CountAsync();
        Assert.Equal(1, count);
    }

    [Fact]
    public async Task AssignPermissionToRoleAsync_CreatesRolePermissionRow()
    {
        await using var db = new TestDb();

        var roleId = Guid.NewGuid();
        db.Context.Add(new ApplicationRole
        {
            Id = roleId,
            Name = "Admin",
            NormalizedName = "ADMIN"
        });
        await db.Context.SaveChangesAsync();

        var roleManager = IdentityMocks.CreateRoleManager();
        roleManager.Setup(r => r.FindByIdAsync(roleId.ToString()))
            .ReturnsAsync(new ApplicationRole { Id = roleId, Name = "Admin" });

        var userManager = IdentityMocks.CreateUserManager();

        var service = new SuperUserPermissionService(db.Context, roleManager.Object, userManager.Object);

        var created = await service.CreatePermissionDefinitionAsync(
            new CreatePermissionDefinitionRequest("ExchangeManage", "Manage exchange", true));

        var permissionId = created.Dto!.PermissionId;
        var assigned = await service.AssignPermissionToRoleAsync(roleId, permissionId);

        Assert.Equal(PermissionAssignmentResult.Success, assigned);

        var exists = await db.Context.Set<RolePermission>()
            .AnyAsync(rp => rp.RoleId == roleId && rp.PermissionId == permissionId);

        Assert.True(exists);
    }

    [Fact]
    public async Task AssignPermissionToUserAsync_RequiresExistingUser()
    {
        await using var db = new TestDb();

        var userId = Guid.NewGuid();
        var roleManager = IdentityMocks.CreateRoleManager();

        var userManager = IdentityMocks.CreateUserManager();
        userManager.Setup(u => u.FindByIdAsync(userId.ToString()))
            .ReturnsAsync((ApplicationUser?)null);

        var service = new SuperUserPermissionService(db.Context, roleManager.Object, userManager.Object);

        var created = await service.CreatePermissionDefinitionAsync(
            new CreatePermissionDefinitionRequest("HousesManage", "Manage houses", true));

        var result = await service.AssignPermissionToUserAsync(userId, created.Dto!.PermissionId);

        Assert.Equal(PermissionAssignmentResult.UserNotFound, result);
        Assert.False(db.Context.Set<UserPermission>().Any());
    }
}
