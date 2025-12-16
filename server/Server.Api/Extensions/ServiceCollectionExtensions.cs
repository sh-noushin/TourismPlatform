using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;
using Server.Api.Infrastructure.Identity;
using Server.Api.Infrastructure.Persistence;
using Server.Api.Infrastructure.Security;
using Server.Api.Infrastructure.Media;
using Server.Modules.Identity.Domain;
using Server.SharedKernel.Auth;

namespace Server.Api.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiCors(this IServiceCollection services)
    {
        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod());
        });

        return services;
    }

    public static IServiceCollection AddOpenApiDocumentation(this IServiceCollection services)
    {
        services.AddOpenApi();
        return services;
    }

    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<SuperUserOptions>(configuration.GetSection("SuperUser"));

        services.AddIdentityCore<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
            })
            .AddRoles<ApplicationRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        services.AddScoped<IdentitySeeder>();

        return services;
    }

    public static IServiceCollection AddPersistence(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Default")
            ?? throw new InvalidOperationException("Connection string 'Default' is not configured.");

        services.AddDbContext<ApplicationDbContext>(options =>
        {
            options.UseSqlServer(connectionString);
        });

        return services;
    }

    public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var jwtSettings = configuration.GetSection("Jwt").Get<JwtSettings>()
            ?? throw new InvalidOperationException("Jwt settings are not configured.");

        services.AddSingleton(jwtSettings);

        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Key)),
                    ClockSkew = TimeSpan.Zero
                };
            });

        services.AddAuthorization(options =>
        {
            options.AddPolicy(PolicyNames.SuperUserOnly, policy => policy.RequireRole(Roles.SuperUser));

            options.AddPolicy(PolicyNames.HousesManage, policy => policy.AddRequirements(new PermissionRequirement(PolicyNames.HousesManage)));
            options.AddPolicy(PolicyNames.ToursManage, policy => policy.AddRequirements(new PermissionRequirement(PolicyNames.ToursManage)));
            options.AddPolicy(PolicyNames.ExchangeManage, policy => policy.AddRequirements(new PermissionRequirement(PolicyNames.ExchangeManage)));
            options.AddPolicy(PolicyNames.UsersManage, policy => policy.AddRequirements(new PermissionRequirement(PolicyNames.UsersManage)));
            options.AddPolicy(PolicyNames.MediaManage, policy => policy.AddRequirements(new PermissionRequirement(PolicyNames.MediaManage)));
        });

        services.AddMemoryCache();
        services.AddScoped<IAuthorizationHandler, PermissionAuthorizationHandler>();

        return services;
    }

    public static IServiceCollection AddMediaServices(this IServiceCollection services)
    {
        services.AddScoped<IPhotoCommitService, PhotoCommitService>();
        return services;
    }
}
