namespace Server.Modules.Properties.Contracts.Houses.Dtos;

public sealed record HousePhotoDto(
    Guid PhotoId,
    string Label,
    int SortOrder,
    string PermanentRelativePath);