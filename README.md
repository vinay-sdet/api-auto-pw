# Restful Booker API Tests

A TypeScript API-only test framework using Playwright Test's request fixtures, Ajv JSON Schema validation, and the built-in HTML reporter. The API contract is based on the [Restful Booker API documentation](https://restful-booker.herokuapp.com/apidoc/index.html).

## Setup

Requirements: Node.js LTS and npm.

```sh
npm install
```

The workspace includes a local `.env` with the API's documented example credentials. To configure another environment, edit `.env` or copy `.env.example` and set:

- `BOOKER_BASE_URL`
- `BOOKER_USERNAME`
- `BOOKER_PASSWORD`

The `.env` file is excluded from Git. Do not commit real credentials.

## Run

```sh
npm test
npm run test:smoke
npm run test:regression
npm run report
npm run typecheck
```

The HTML report is written to `playwright-report/`. Failed tests attach request and response details with password, token, authorization, and cookie values redacted.

## Structure

- `config/`: environment configuration
- `src/clients/`: reusable authentication and booking API clients
- `src/fixtures/`: shared Playwright fixtures, booking setup/cleanup, and failure logging
- `src/schemas/`: JSON Schemas for auth, booking, and create-booking responses
- `src/utils/`: test data, request logging, and schema validation helpers
- `tests/`: positive and negative API scenarios