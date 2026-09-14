namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record UpdateTourCategoryRequest(string Name, string? NameEn = null);
