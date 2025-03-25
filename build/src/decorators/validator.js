"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = Validate;
const zod_1 = require("zod");
function Validate(schema) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (req, res, next) {
            try {
                // Validate the request body using Zod schema
                schema.parse(req.body); // `parse` will throw an error if validation fails
            }
            catch (error) {
                if (error instanceof zod_1.ZodError) {
                    // Handle Zod validation errors
                    const errors = error.errors.map(e => ({
                        message: e.message,
                        path: e.path,
                    }));
                    return res.status(400).json({ errors });
                }
                // Pass any other errors to the next middleware
                return next(error);
            }
            // If validation passes, call the original method
            return originalMethod.call(this, req, res, next);
        };
        return descriptor;
    };
}
