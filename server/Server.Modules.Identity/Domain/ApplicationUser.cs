using Microsoft.AspNetCore.Identity;

namespace Server.Modules.Identity.Domain;

public class ApplicationUser : IdentityUser<Guid>
{
	public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
}
