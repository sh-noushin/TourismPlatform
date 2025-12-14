using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Server.Api.Infrastructure.Persistence;

public sealed class ApplicationDbContext : IdentityDbContext<Server.Modules.Identity.Domain.ApplicationUser, Server.Modules.Identity.Domain.ApplicationRole, Guid>
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Identity.Domain._ModuleAnchor).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Properties.Domain._ModuleAnchor).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Tours.Domain._ModuleAnchor).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Exchange.Domain._ModuleAnchor).Assembly);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(Server.Modules.Media.Domain._ModuleAnchor).Assembly);
    }
}
