export const resolveSortValue = (
  query: Record<string, string | string[] | undefined>,
  defaultValue: string
) => {
  const sortParam = query.sort;
  if (!sortParam) return defaultValue;
  if (Array.isArray(sortParam)) return sortParam.at(0) ?? defaultValue;
  return sortParam;
};
