namespace Server.Modules.Identity.Domain.RefreshTokens;

public class RefreshToken
{
    public Guid RefreshTokenId { get; set; }
    public Guid UserId { get; set; }
    public string TokenHash { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public Guid? ReplacedByRefreshTokenId { get; set; }
    public string? CreatedByIp { get; set; }
    public string? RevokedByIp { get; set; }
    public string? UserAgent { get; set; }

    public Users.ApplicationUser? User { get; set; }
}
