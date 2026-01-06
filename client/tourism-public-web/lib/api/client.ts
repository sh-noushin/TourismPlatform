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
    const base = process.env.API_BASE_URL;
    if (!base) {
      throw new Error("API_BASE_URL must be defined for server-side requests");
    }

    const url = `${base.replace(/\/$/, "")}${proxyPath}${search}`;
    const dispatcher = await getServerDispatcher(url);
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      ...(dispatcher ? { dispatcher } : {}),
    });
    return ensureOk<T>(response);
  }

  const response = await fetch(`/api/proxy${proxyPath}${search}`, {
    headers: { Accept: "application/json" },
  });

  return ensureOk<T>(response);
}
