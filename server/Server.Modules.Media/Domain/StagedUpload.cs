namespace Server.Modules.Media.Domain;

public sealed class StagedUpload
{
    public Guid Id { get; set; }

    public StagedUploadTargetType TargetType { get; set; }

    public string TempRelativePath { get; set; } = string.Empty;

    public string UuidFileName { get; set; } = string.Empty;

    public string Extension { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }

    public string? OriginalFileName { get; set; }

    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }

    public Guid? UploadedByUserId { get; set; }
}
