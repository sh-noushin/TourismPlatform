namespace Server.Modules.Media.Domain;

public sealed class Photo
{
    public Guid Id { get; set; }

    public string UuidFileName { get; set; } = string.Empty;

    public string PermanentRelativePath { get; set; } = string.Empty;

    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }

    public string? OriginalFileName { get; set; }

    public DateTime CreatedAtUtc { get; set; }

    public Guid? UploadedByUserId { get; set; }
}
