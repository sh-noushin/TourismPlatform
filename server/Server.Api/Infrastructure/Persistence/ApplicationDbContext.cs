using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Server.Modules.Identity.Domain.Roles;
using Server.Modules.Identity.Domain.Users;

namespace Server.Api.Infrastructure.Persistence;

public sealed class ApplicationDbContext : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Identity.Domain._ModuleAnchor).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Properties.Domain._ModuleAnchor).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Tours.Domain._ModuleAnchor).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Exchange.Domain._ModuleAnchor).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Media.Domain._ModuleAnchor).Assembly);
    }
}
