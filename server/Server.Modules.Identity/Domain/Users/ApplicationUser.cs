using Microsoft.AspNetCore.Identity;
using Server.Modules.Identity.Domain.RefreshTokens;

namespace Server.Modules.Identity.Domain.Users;

public class ApplicationUser : IdentityUser<Guid>
{
    public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
