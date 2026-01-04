const normalizeBaseUrl = (value?: string) => value?.replace(/\/+$/, "") ?? "";

const trimLeadingSlashes = (value: string) => value.replace(/^\/+/, "");

const backendBaseUrl = normalizeBaseUrl(process.env.API_BASE_URL);

export const imageUrl = (relativePath?: string | null) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  const cleanPath = trimLeadingSlashes(relativePath);
  // Prefer proxying through Next.js so browsers don't have to trust local HTTPS dev certs
  // and we avoid CORS issues. The proxy will forward to API_BASE_URL.
  return `/api/proxy/${cleanPath}`;
};
