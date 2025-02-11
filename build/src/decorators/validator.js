"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Validate = Validate;
const zod_1 = require("zod");
function Validate(schema) {
    return function (target, propertyKey, descriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = function (req, res, next) {
            return __awaiter(this, void 0, void 0, function* () {
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
            });
        };
        return descriptor;
    };
}
