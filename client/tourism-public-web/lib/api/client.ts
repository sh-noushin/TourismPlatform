import { ensureOk } from "./errors";

export type QueryParams = Record<string, string | number | boolean | undefined>;

const serializeParams = (params?: QueryParams) => {
  if (!params) return "";
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined) return;
    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
};

const buildProxyPath = (path: string) => {
  const normalized = path.replace(/^\/+/, "");
  return normalized ? `/${normalized}` : "";
};

export async function getJson<T = unknown>(path: string, params?: QueryParams): Promise<T> {
  const search = serializeParams(params);
  const proxyPath = buildProxyPath(path);
  const response = await fetch(`/api/proxy${proxyPath}${search}`, {
    headers: { Accept: "application/json" },
  });

  return ensureOk<T>(response);
}
