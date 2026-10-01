import type { APIRequestContext, APIResponse } from "@playwright/test";
import type { RequestLogEntry } from "../utils/request-logger";
import { sendLoggedRequest } from "../utils/request-logger";
import { validateSchema } from "../utils/schema-validator";

export interface Credentials {
  username: string;
  password: string;
}

export class AuthClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly log: RequestLogEntry[],
  ) {}

  createToken(credentials: Credentials): Promise<APIResponse> {
    return sendLoggedRequest(this.request, this.log, "POST", "/auth", { data: credentials });
  }

  async getToken(credentials: Credentials): Promise<string> {
    const response = await this.createToken(credentials);
    if (response.status() !== 200) {
      throw new Error(`Authentication failed with status ${response.status()}`);
    }

    const body: unknown = await response.json();
    validateSchema(body, "auth");
    return (body as { token: string }).token;
  }
}