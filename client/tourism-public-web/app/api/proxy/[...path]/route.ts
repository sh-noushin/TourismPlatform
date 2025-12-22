import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL;

const getBackendUrl = (segments: string[] = [], search: string) => {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL must be defined");
  }

  const cleanedSegments = segments.filter((segment) => segment !== "");
  const pathSuffix = cleanedSegments.join("/");
  const normalizedBase = API_BASE_URL.replace(/\/$/, "");
  const rawUrl = pathSuffix ? `${normalizedBase}/${pathSuffix}` : normalizedBase;
  const url = new URL(rawUrl);
  url.search = search;
  return url;
};

const buildHeaders = (req: NextRequest) => {
  const headers = new Headers(req.headers);
  headers.set("x-forwarded-host", req.headers.get("host") ?? "");
  headers.set("x-forwarded-proto", req.nextUrl.protocol.replace(":", ""));
  headers.set("x-forwarded-for", req.headers.get("x-forwarded-for") ?? "");
  if (!headers.has("accept")) {
    headers.set("accept", "application/json");
  }
  return headers;
};

export async function GET(
  request: NextRequest,
  { params }: { params?: { path?: string[] } }
) {
  let targetUrl: URL;

  try {
    targetUrl = getBackendUrl(params?.path ?? [], request.nextUrl.search);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Backend configuration missing";
    return NextResponse.json({ message }, { status: 500 });
  }

  const response = await fetch(targetUrl.toString(), {
    method: "GET",
    headers: buildHeaders(request),
  });

  const responseHeaders = new Headers(response.headers);
  return new NextResponse(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}
