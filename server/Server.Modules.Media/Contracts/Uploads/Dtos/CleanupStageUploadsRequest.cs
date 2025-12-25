using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Modules.Media.Contracts.Uploads.Dtos;

public sealed class CleanupStageUploadsRequest
{
    [Required]
    [MinLength(1)]
    public Guid[] StagedUploadIds { get; set; } = [];
}
