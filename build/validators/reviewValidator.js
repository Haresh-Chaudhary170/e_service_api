"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewValidationSchema = void 0;
const zod_1 = require("zod");
exports.reviewValidationSchema = zod_1.z.object({
    serviceId: zod_1.z.string().min(1, "Service ID is required"),
    rating: zod_1.z.string().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: zod_1.z.string().optional(),
    images: zod_1.z.array(zod_1.z.string().url()).optional(),
});
