using System;
using System.ComponentModel.DataAnnotations;

namespace Server.Modules.Media.Contracts.Uploads.Dtos;

public sealed record CleanupStageUploadsRequest(
    [property: Required]
    [property: MinLength(1)]
    Guid[] StagedUploadIds);
