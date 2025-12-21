using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Server.Modules.Identity.Domain.Roles;
using Server.Modules.Identity.Domain.Users;

namespace Server.Tests.Common;

internal static class IdentityMocks
{
    public static Mock<RoleManager<ApplicationRole>> CreateRoleManager()
    {
        var store = new Mock<IRoleStore<ApplicationRole>>();
        var roleValidators = new List<IRoleValidator<ApplicationRole>>
        {
            new RoleValidator<ApplicationRole>()
        };

        return new Mock<RoleManager<ApplicationRole>>(
            store.Object,
            roleValidators,
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            new Mock<ILogger<RoleManager<ApplicationRole>>>().Object);
    }

    public static Mock<UserManager<ApplicationUser>> CreateUserManager()
    {
        var store = new Mock<IUserStore<ApplicationUser>>();

        return new Mock<UserManager<ApplicationUser>>(
            store.Object,
            new Mock<IOptions<IdentityOptions>>().Object,
            new PasswordHasher<ApplicationUser>(),
            new List<IUserValidator<ApplicationUser>> { new UserValidator<ApplicationUser>() },
            new List<IPasswordValidator<ApplicationUser>> { new PasswordValidator<ApplicationUser>() },
            new UpperInvariantLookupNormalizer(),
            new IdentityErrorDescriber(),
            new Mock<IServiceProvider>().Object,
            new Mock<ILogger<UserManager<ApplicationUser>>>().Object);
    }
}
