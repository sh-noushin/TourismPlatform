namespace Server.SharedKernel.Paging;

/// <summary>
/// One page of a list, plus the total the caller needs to draw a pager.
/// </summary>
public sealed record PagedResult<T>(IReadOnlyCollection<T> Items, int Total, int Page, int PageSize)
{
    public static PagedResult<T> Empty(int page, int pageSize) =>
        new(Array.Empty<T>(), 0, page, pageSize);
}

/// <summary>
/// The query behind a list screen: which page, how big, filtered by what, in
/// what order.
///
/// <see cref="Normalized"/> is the important part. Page and size arrive from a
/// query string, so they arrive as anything -- zero, negative, or 100000 rows
/// meant to pull the whole table through one request. Clamping once here means
/// no repository has to defend itself.
/// </summary>
public sealed record PageQuery(int Page = 1, int PageSize = 10, string? Search = null, string? Sort = null)
{
    public const int MaxPageSize = 200;

    public PageQuery Normalized() => new(
        Page < 1 ? 1 : Page,
        PageSize switch
        {
            < 1 => 10,
            > MaxPageSize => MaxPageSize,
            _ => PageSize
        },
        string.IsNullOrWhiteSpace(Search) ? null : Search.Trim(),
        string.IsNullOrWhiteSpace(Sort) ? null : Sort.Trim());

    public int Skip => (Page - 1) * PageSize;

    /// <summary>
    /// Splits a "field:direction" sort term (e.g. <c>name:desc</c>). The field
    /// alone means ascending, which is what a table sends on first click.
    /// </summary>
    public (string Field, bool Descending) SortOrDefault(string defaultField)
    {
        if (string.IsNullOrWhiteSpace(Sort))
        {
            return (defaultField, false);
        }

        var parts = Sort.Split(':', 2, StringSplitOptions.TrimEntries);
        var field = string.IsNullOrWhiteSpace(parts[0]) ? defaultField : parts[0];
        var descending = parts.Length > 1 && parts[1].Equals("desc", StringComparison.OrdinalIgnoreCase);
        return (field, descending);
    }
}
