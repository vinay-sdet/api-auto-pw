import type { APIRequestContext, APIResponse } from "@playwright/test";
import { env } from "../../config/env";

export type RequestLogEntry = {
  method: string;
  url: string;
  request: { headers?: Record<string, unknown>; body?: unknown };
  response?: {
    status: number;
    headers: Record<string, unknown>;
    body: unknown;
  };
  error?: string;
};

type LoggedRequestOptions = {
  data?: object | string | Buffer;
  headers?: Record<string, string>;
};

function redact(value: unknown, key = ""): unknown {
  if (/password|token|authorization|cookie/i.test(key)) {
    return "[REDACTED]";
  }
  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }
  if (value && typeof value === "object" && !Buffer.isBuffer(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [childKey, redact(childValue, childKey)]),
    );
  }
  return value;
}

function parseBody(body: string): unknown {
  try {
    return redact(JSON.parse(body));
  } catch {
    return body;
  }
}

export async function sendLoggedRequest(
  request: APIRequestContext,
  log: RequestLogEntry[],
  method: string,
  path: string,
  options: LoggedRequestOptions = {},
): Promise<APIResponse> {
  const entry: RequestLogEntry = {
    method,
    url: new URL(path, env.baseUrl).toString(),
    request: {
      headers: redact(options.headers) as Record<string, unknown> | undefined,
      body: redact(options.data),
    },
  };
  log.push(entry);

  try {
    const response = await request.fetch(path, { method, ...options });
    entry.response = {
      status: response.status(),
      headers: redact(response.headers()) as Record<string, unknown>,
      body: parseBody(await response.text()),
    };
    return response;
  } catch (error) {
    entry.error = error instanceof Error ? error.message : String(error);
    throw error;
  }
}