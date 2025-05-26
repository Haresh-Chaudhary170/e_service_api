import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export function Validate<T = any>(schema: z.ZodSchema<T>) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (req: Request, res: Response, next: NextFunction) {
            try {
                // Validate the request body using Zod schema
                schema.parse(req.body);  // `parse` will throw an error if validation fails
            } catch (error) {
                if (error instanceof ZodError) {
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
