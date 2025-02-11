"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationValidationSchema = void 0;
const zod_1 = require("zod");
exports.notificationValidationSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, "Title is required"),
    titleNp: zod_1.z.string().optional(),
    message: zod_1.z.string().min(1, "Message is required"),
    messageNp: zod_1.z.string().optional(),
    type: zod_1.z.enum(["BOOKING", "PAYMENT", "SYSTEM", "PROMOTIONAL"]),
    priority: zod_1.z.enum(["HIGH", "NORMAL", "LOW"]).default("NORMAL"),
    read: zod_1.z.boolean().default(false),
    readAt: zod_1.z.string().optional().nullable(), // Should be a valid date-time string
    actionUrl: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
    data: zod_1.z.any().optional(),
    expiresAt: zod_1.z.string().optional().nullable(), // Should be a valid date-time string
});
