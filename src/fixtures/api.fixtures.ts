import { test as base, expect } from "@playwright/test";
import { env } from "../../config/env";
import { AuthClient } from "../clients/auth.client";
import { BookingClient } from "../clients/booking.client";
import type { BookingPayload } from "../utils/booking-data";
import { createBookingPayload } from "../utils/booking-data";
import type { RequestLogEntry } from "../utils/request-logger";
import { validateSchema } from "../utils/schema-validator";

type CreatedBooking = {
    id: number;
    payload: BookingPayload;
    responseBody: { bookingid: number; booking: BookingPayload };
    responseStatus: number;
};

type ApiFixtures = {
    apiLog: RequestLogEntry[];
    authClient: AuthClient;
    bookingClient: BookingClient;
    token: string;
    createdBooking: CreatedBooking;
};

export const test = base.extend<ApiFixtures>({
    apiLog: async ({ }, use) => {
        await use([]);
    },

    authClient: async ({ request, apiLog }, use) => {
        await use(new AuthClient(request, apiLog));
    },

    bookingClient: async ({ request, apiLog }, use) => {
        await use(new BookingClient(request, apiLog));
    },

    token: async ({ authClient }, use) => {
        const token = await authClient.getToken({
            username: env.username,
            password: env.password,
        });
        await use(token);
    },

    createdBooking: async ({ bookingClient, token }, use) => {
        const payload = createBookingPayload();
        const response = await bookingClient.createBooking(payload);
        expect(response.status()).toBe(200);

        const responseBody = await response.json();
        validateSchema(responseBody, "create-booking");
        const created = {
            id: responseBody.bookingid as number,
            payload,
            responseBody: responseBody as CreatedBooking["responseBody"],
            responseStatus: response.status(),
        };

        try {
            await use(created);
        } finally {
            await bookingClient.deleteBooking(created.id, token).catch(() => undefined);
        }
    },
});

test.beforeEach(async ({ apiLog }, testInfo) => {
    testInfo.annotations.push({
        type: "api-fixtures",
        description: `Per-test request log initialized with ${apiLog.length} setup request(s)`,
    });
});

test.afterEach(async ({ apiLog }, testInfo) => {
    if (testInfo.status === testInfo.expectedStatus || apiLog.length === 0) {
        return;
    }
    await testInfo.attach("api-request-response-log", {
        body: JSON.stringify(apiLog, null, 2),
        contentType: "application/json",
    });
});

export { expect } from "@playwright/test";