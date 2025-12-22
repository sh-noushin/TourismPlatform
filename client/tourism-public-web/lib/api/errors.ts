export type ApiErrorPayload = unknown;

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly payload: ApiErrorPayload, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const tryParseJson = async (response: Response) => {
  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

export const ensureOk = async <T>(response: Response): Promise<T> => {
  const payload = await tryParseJson(response);
  if (!response.ok) {
    const message = typeof payload === "string" ? payload : (payload as { message?: string })?.message ?? response.statusText;
    throw new ApiError(response.status, payload, message);
  }

  return payload as T;
};
