using System.Collections.Generic;
using System.IO;

namespace Server.Modules.Media.Domain.Uploads;

public static class StagedUploadFolders
{
    private static readonly Dictionary<StagedUploadTargetType, string> TempFolderMap = new()
    {
        [StagedUploadTargetType.House] = Path.Combine("images", "houses", "Temp"),
        [StagedUploadTargetType.Tour] = Path.Combine("images", "tours", "Temp")
    };

    public static IReadOnlyDictionary<StagedUploadTargetType, string> TempFolders => TempFolderMap;
}
