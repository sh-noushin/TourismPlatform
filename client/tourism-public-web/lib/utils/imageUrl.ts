const normalizeBaseUrl = (value?: string) => value?.replace(/\/+$/, "") ?? "";

const trimLeadingSlashes = (value: string) => value.replace(/^\/+/, "");

const backendBaseUrl = normalizeBaseUrl(process.env.API_BASE_URL);

export const imageUrl = (relativePath?: string | null) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  const cleanPath = trimLeadingSlashes(relativePath);
  return backendBaseUrl ? `${backendBaseUrl}/${cleanPath}` : `/${cleanPath}`;
};
