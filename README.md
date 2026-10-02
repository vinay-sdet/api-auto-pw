# Restful Booker API Test Suite

This project contains a Playwright-based API test suite for the Restful Booker service. It verifies authentication, booking CRUD flows, schema validation, and negative scenarios using real HTTP requests against the public API and local test fixtures.

## Overview

The suite exercises:

- Auth token creation and invalid credential handling
- Booking creation, retrieval, update, partial update, and deletion
- Validation against JSON schemas with Ajv
- Smoke and regression tagging with `@smoke` and `@regression`
- HTML reporting with request/response logging for failed runs

The API contract is based on the [Restful Booker API documentation](https://restful-booker.herokuapp.com/apidoc/index.html).

## Prerequisites

- Node.js 18+ or newer
- npm

## Setup

1. Install dependencies:

```sh
npm install
```

2. Create your local environment file:

```sh
copy .env.example .env
```

On macOS/Linux, use:

```sh
cp .env.example .env
```

3. Update the values in `.env` if needed:

- `BOOKER_BASE_URL` (defaults to `https://restful-booker.herokuapp.com`)
- `BOOKER_USERNAME`
- `BOOKER_PASSWORD`

The `.env` file is local-only and should never be committed.

## Run the tests

```sh
npm test
npm run test:smoke
npm run test:regression
npm run report
npm run typecheck
```

### What each script does

- `npm test`: runs the full Playwright suite
- `npm run test:smoke`: runs only tests tagged with `@smoke`
- `npm run test:regression`: runs only tests tagged with `@regression`
- `npm run report`: opens the HTML test report
- `npm run typecheck`: checks TypeScript compilation without emitting files

## Test behavior

The suite includes a health check before the booking tests run:

- `GET /ping` is expected to return status `201`

Booking-related tests validate both response status and schema structure, and they cover error paths such as:

- unauthorized PUT/DELETE requests
- invalid tokens
- non-existent booking IDs

## Project structure

- `config/`: environment configuration and required variables
- `src/clients/`: auth and booking API clients
- `src/fixtures/`: shared Playwright fixtures and test setup
- `src/schemas/`: JSON Schema definitions for API payloads and responses
- `src/utils/`: booking data, request logging, and validation helpers
- `tests/`: API regression and smoke scenarios
- `playwright-report/`: generated HTML reports

## Notes

- Playwright is configured with `trace: "retain-on-failure"` and HTML reporting enabled.
- Failed runs retain diagnostics useful for debugging requests, status codes, and payloads.
- Sensitive values such as passwords, auth tokens, and cookies are redacted in the logging output.