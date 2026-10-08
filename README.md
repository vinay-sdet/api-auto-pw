# Restful Booker API Test Suite

Playwright API tests for the [Restful Booker](https://restful-booker.herokuapp.com/apidoc/index.html) service. Every scenario sends a real HTTP request, then checks the status code and, where a body is returned, validates it with Ajv.

## Overview

The suite covers:

- Auth token creation, including the auth response schema
- Invalid credentials, which return `200` with `{ "reason": "Bad credentials" }`
- Booking create, get, full update (`PUT`), partial update (`PATCH`), and delete
- Negative booking cases: missing token, invalid token, and an unknown booking id
- Smoke and regression tags (`@smoke`, `@regression`)
- An HTML report, with a redacted request/response log attached when a test fails

## Prerequisites

- Node.js 18 or newer
- npm

## Setup

1. Install dependencies:

```sh
npm install
```

2. Create a local environment file.

Windows:

```sh
copy .env.example .env
```

macOS and Linux:

```sh
cp .env.example .env
```

3. Edit `.env` when you need a different target or credentials.

| Variable | Required | Default |
| --- | --- | --- |
| `BOOKER_BASE_URL` | No | `https://restful-booker.herokuapp.com` |
| `BOOKER_USERNAME` | Yes | — |
| `BOOKER_PASSWORD` | Yes | — |

`.env.example` includes the public demo credentials (`admin` / `password123`). Tests fail at startup if `BOOKER_USERNAME` or `BOOKER_PASSWORD` is missing. `.env` is gitignored.

## Run the tests

```sh
npm test
npm run test:smoke
npm run test:regression
npm run report
npm run typecheck
```

| Script | What it does |
| --- | --- |
| `npm test` | Runs the full suite |
| `npm run test:smoke` | Runs tests tagged `@smoke` |
| `npm run test:regression` | Runs tests tagged `@regression` |
| `npm run report` | Opens the HTML report in `playwright-report/` |
| `npm run typecheck` | Type-checks the project with `tsc --noEmit` |

## How a run works

`playwright.config.ts` sets `baseURL` from `BOOKER_BASE_URL` and sends `Accept` and `Content-Type` as `application/json`. Tests run in parallel. Retries are `1` when `CI` is set and `0` otherwise. Traces are kept on failure, and the HTML reporter does not open automatically.

Shared fixtures in `src/fixtures/api.fixtures.ts`:

- `authClient` and `bookingClient` call the API and record each request
- `token` logs in with the configured credentials and checks the `auth` schema
- `createdBooking` posts a unique booking, checks the `create-booking` schema, and deletes that booking after the test

`PUT`, `PATCH`, and `DELETE` send the token as `Cookie: token=<token>`.

Booking tests call `GET /ping` once before the file runs and expect status `201`.

When a test fails, the recorded calls are attached as `api-request-response-log`. Passwords, tokens, authorization headers, and cookies are replaced with `[REDACTED]`.

## Scenarios

| Test | Tags | Expected result |
| --- | --- | --- |
| Creates a token | `@smoke` `@regression` | Non-empty token string |
| Rejects invalid credentials | `@regression` | `200` and `{ "reason": "Bad credentials" }` |
| Creates a booking | `@smoke` `@regression` | `200`, `create-booking` schema, echoed name |
| Gets a booking | `@smoke` `@regression` | `200`, `booking` schema, matching price and name |
| Updates a booking with PUT | `@regression` | `200`, `booking` schema, updated body |
| Partially updates a booking with PATCH | `@regression` | `200`, first name changes, last name stays |
| Deletes a booking | `@regression` | `201`, then get returns `404` |
| Rejects PUT without a token | `@regression` | `403` |
| Rejects PUT with an invalid token | `@regression` | `403` |
| Rejects DELETE without a token | `@regression` | `403` |
| Rejects DELETE with an invalid token | `@regression` | `403` |
| Gets a missing booking | `@regression` | `404` |

Schema files live in `src/schemas/`: `auth.schema.json`, `booking.schema.json`, and `create-booking.schema.json`.

## Project structure

- `config/` — environment variables
- `src/clients/` — auth and booking API clients
- `src/fixtures/` — Playwright fixtures, booking setup and cleanup, failure attachments
- `src/schemas/` — JSON Schemas checked by Ajv
- `src/utils/` — booking payloads, request logging, and schema validation
- `tests/` — auth and booking specs
- `playwright-report/` and `test-results/` — generated output, both gitignored
