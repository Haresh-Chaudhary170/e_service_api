"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addressSchema = exports.providerDocumentSchema = exports.providerValidationSchema = exports.customerValidationSchema = exports.userValidationSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.userValidationSchema = zod_1.default.object({
    firstName: zod_1.default.string().min(1, "First name is required"),
    lastName: zod_1.default.string().min(1, "Last name is required"),
    role: zod_1.default.enum(['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN']),
    email: zod_1.default.string().email("Invalid email format"),
    phone: zod_1.default.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d{10}$/, 'Phone number must contain only digits'),
    password: zod_1.default.string().min(6, "Password must be at least 6 characters"),
});
exports.customerValidationSchema = zod_1.default.object({
    userId: zod_1.default.string().min(1, "Missing user id"),
    emergencyContact: zod_1.default.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d{10}$/, 'Phone number must contain only digits').optional(),
});
exports.providerValidationSchema = zod_1.default.object({
    userId: zod_1.default.string().min(1, "Missing user id"),
    bio: zod_1.default.string().min(20, "Minimum character is 20.").optional(),
    experience: zod_1.default.number().int().nonnegative().optional(), // Experience is an integer and non-negative
    businessName: zod_1.default.string().nullable().optional(), // Business name is optional and can be null
    categoryId: zod_1.default.string().min(1, "Category is missing!")
});
exports.providerDocumentSchema = zod_1.default.object({
    providerId: zod_1.default.string().min(1, "Service provider id required!"),
    type: zod_1.default.enum(["ID_PROOF", "CERTIFICATION", "Driving_LICENSE", "PASSPORT", "VOTER_ID_CARD", "PAN_CARD", "OTHER"]),
    name: zod_1.default.string().min(1, "Name requiired"),
    //image as file
    image: zod_1.default.string(),
    metadata: zod_1.default.string().optional(),
});
exports.addressSchema = zod_1.default.object({
    userId: zod_1.default.string(),
    type: zod_1.default.enum(['HOME', 'OFFICE', 'OTHER']),
    name: zod_1.default.string().min(1, 'Address label is required'),
    street: zod_1.default.string().min(1, 'Street address is required'),
    area: zod_1.default.string().optional(),
    city: zod_1.default.string().min(1, 'City is required'),
    state: zod_1.default.string().min(1, 'State is required'),
    zipCode: zod_1.default.string().optional(),
    landmark: zod_1.default.string().optional(),
    location: zod_1.default.string(),
    metadata: zod_1.default.unknown().optional()
});
