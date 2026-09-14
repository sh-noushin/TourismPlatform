namespace Server.Modules.Tours.Contracts.Tours.Dtos;

public sealed record CreateTourCategoryRequest(string Name, string? NameEn = null);
