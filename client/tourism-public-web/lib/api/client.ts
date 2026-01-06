import type { Agent, Dispatcher } from "undici";
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

let insecureLocalAgent: Agent | null = null;

const DEV_DEFAULT_API_BASE = "http://localhost:5266";

const allowInsecureTls = (url: string) => {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch {
    return false;
  }
};

const getServerDispatcher = async (url: string): Promise<Dispatcher | undefined> => {
  if (typeof window !== "undefined") {
    return undefined;
  }

  if (!allowInsecureTls(url)) {
    return undefined;
  }

  if (!insecureLocalAgent) {
    const { Agent } = await import("undici");
    insecureLocalAgent = new Agent({
      connect: {
        // Allow self-signed certs for local development hosts
        rejectUnauthorized: false,
      },
    });
  }

  return insecureLocalAgent;
};

export async function getJson<T = unknown>(path: string, params?: QueryParams): Promise<T> {
  const search = serializeParams(params);
  const proxyPath = buildProxyPath(path);
  if (typeof window === "undefined") {
    const base = (process.env.API_BASE_URL ?? DEV_DEFAULT_API_BASE).replace(/\/$/, "");
    const url = `${base}${proxyPath}${search}`;

    const fetchWithDispatcher = async (targetUrl: string) => {
      const dispatcher = await getServerDispatcher(targetUrl);
      return fetch(targetUrl, {
        headers: { Accept: "application/json" },
        ...(dispatcher ? { dispatcher } : {}),
      });
    };

    let response: Response;
    try {
      response = await fetchWithDispatcher(url);
    } catch (error) {
      const fallbackUrl =
        process.env.NODE_ENV !== "production" && url.startsWith("https://localhost:7110")
          ? `${DEV_DEFAULT_API_BASE}${proxyPath}${search}`
          : null;

      if (!fallbackUrl) {
        throw error;
      }

      response = await fetchWithDispatcher(fallbackUrl);
    }

    return ensureOk<T>(response);
  }

  const response = await fetch(`/api/proxy${proxyPath}${search}`, {
    headers: { Accept: "application/json" },
  });

  return ensureOk<T>(response);
}
