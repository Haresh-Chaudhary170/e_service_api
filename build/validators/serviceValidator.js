"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceValidationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.serviceValidationSchema = zod_1.default.object({
    name: zod_1.default.string().min(1, "Name is required"), // The name should be a non-empty string
    description: zod_1.default.string().min(1, "Description is required"), // The description should also be a non-empty string
    price: zod_1.default.string().min(1, "Price must be a positive number"), // Price should be a positive number
    duration: zod_1.default.string().min(1, "Duration must be a positive integer"), // Duration should be an integer greater than 0
    providerId: zod_1.default.string().min(1, "Provider ID is required"),
    categoryId: zod_1.default.string().min(1, "Service ID is required"),
});
