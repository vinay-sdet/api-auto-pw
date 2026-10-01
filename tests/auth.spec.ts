import { env } from "../config/env";
import { expect, test } from "../src/fixtures/api.fixtures";

test("creates a token with configured credentials @smoke @regression", async ({ token }) => {
    expect(token).toEqual(expect.any(String));
    expect(token.length).toBeGreaterThan(0);
});

test("rejects invalid credentials @regression", async ({ authClient }) => {
    const response = await authClient.createToken({
        username: env.username,
        password: `${env.password}-invalid`,
    });

    expect(response.status()).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ reason: "Bad credentials" });
});