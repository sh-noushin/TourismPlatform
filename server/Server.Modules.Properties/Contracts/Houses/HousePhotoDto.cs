namespace Server.Modules.Properties.Contracts.Houses;

public sealed record HousePhotoDto(
    Guid PhotoId,
    string Label,
    int SortOrder,
    string PermanentRelativePath);
