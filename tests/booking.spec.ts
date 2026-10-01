import { request as playwrightRequest } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";
import { env } from "../config/env";
import { expect, test } from "../src/fixtures/api.fixtures";
import { createBookingPayload } from "../src/utils/booking-data";
import { validateSchema } from "../src/utils/schema-validator";

let healthRequest: APIRequestContext;

test.beforeAll(async () => {
    healthRequest = await playwrightRequest.newContext({ baseURL: env.baseUrl });
    const response = await healthRequest.get("/ping");
    expect(response.status()).toBe(201);
});

test.afterAll(async () => {
    await healthRequest.dispose();
});

test("creates a booking @smoke @regression", async ({ createdBooking }) => {
    expect(createdBooking.responseStatus).toBe(200);
    validateSchema(createdBooking.responseBody, "create-booking");
    expect(createdBooking.responseBody.bookingid).toBe(createdBooking.id);
    expect(createdBooking.responseBody.booking.firstname).toBe(createdBooking.payload.firstname);
    expect(createdBooking.responseBody.booking.lastname).toBe(createdBooking.payload.lastname);
});

test("gets a booking and validates its schema @smoke @regression", async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.getBooking(createdBooking.id);
    expect(response.status()).toBe(200);
    const body = await response.json();
    validateSchema(body, "booking");
    expect(body.firstname).toBe(createdBooking.payload.firstname);
    expect(body.lastname).toBe(createdBooking.payload.lastname);
    expect(body.totalprice).toBe(createdBooking.payload.totalprice);
});

test("updates a booking with PUT @regression", async ({ bookingClient, createdBooking, token }) => {
    const updatedBooking = { ...createdBooking.payload, firstname: "Updated-Put" };
    const response = await bookingClient.updateBooking(createdBooking.id, token, updatedBooking);
    expect(response.status()).toBe(200);
    const body = await response.json();
    validateSchema(body, "booking");
    expect(body).toMatchObject(updatedBooking);
});

test("partially updates a booking with PATCH @regression", async ({ bookingClient, createdBooking, token }) => {
    const response = await bookingClient.partialUpdateBooking(createdBooking.id, token, {
        firstname: "Updated-Patch",
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    validateSchema(body, "booking");
    expect(body.firstname).toBe("Updated-Patch");
    expect(body.lastname).toBe(createdBooking.payload.lastname);
});

test("deletes a booking @regression", async ({ bookingClient, createdBooking, token }) => {
    const response = await bookingClient.deleteBooking(createdBooking.id, token);
    expect(response.status()).toBe(201);

    const getResponse = await bookingClient.getBooking(createdBooking.id);
    expect(getResponse.status()).toBe(404);
});

test("rejects PUT without a token @regression", async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.updateBooking(createdBooking.id, undefined, createBookingPayload());
    expect(response.status()).toBe(403);
});

test("rejects PUT with an invalid token @regression", async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.updateBooking(createdBooking.id, "invalid-token", createBookingPayload());
    expect(response.status()).toBe(403);
});

test("rejects DELETE without a token @regression", async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.deleteBooking(createdBooking.id, undefined);
    expect(response.status()).toBe(403);
});

test("rejects DELETE with an invalid token @regression", async ({ bookingClient, createdBooking }) => {
    const response = await bookingClient.deleteBooking(createdBooking.id, "invalid-token");
    expect(response.status()).toBe(403);
});

test("returns 404 for a non-existent booking @regression", async ({ bookingClient }) => {
    const response = await bookingClient.getBooking(Number.MAX_SAFE_INTEGER);
    expect(response.status()).toBe(404);
});