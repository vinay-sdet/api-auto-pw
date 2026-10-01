import Ajv from "ajv";
import addFormats from "ajv-formats";
import authSchema from "../schemas/auth.schema.json";
import bookingSchema from "../schemas/booking.schema.json";
import createBookingSchema from "../schemas/create-booking.schema.json";

const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

const validators = {
    auth: ajv.compile(authSchema),
    booking: ajv.compile(bookingSchema),
    "create-booking": ajv.compile(createBookingSchema),
};

export type SchemaName = keyof typeof validators;

export function validateSchema(responseJson: unknown, schemaName: SchemaName): void {
    const validator = validators[schemaName];
    if (validator(responseJson)) {
        return;
    }

    const errors = validator.errors?.map((error) => {
        const location = error.instancePath || "response";
        return `${location} ${error.message ?? "is invalid"}`;
    });
    throw new Error(`Schema validation failed for ${schemaName}:\n${errors?.join("\n") ?? "Unknown validation error"}`);
}