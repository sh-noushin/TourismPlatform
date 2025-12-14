using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Server.Modules.Media.Domain;

namespace Server.Modules.Media.Contracts.Uploads;

public sealed class StageUploadRequest
{
    [Required]
    public IFormFile? File { get; init; }

    [Required]
    public StagedUploadTargetType TargetType { get; init; } = StagedUploadTargetType.House;
}
