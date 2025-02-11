"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingValidationSchema = exports.BookingStatusEnum = void 0;
const zod_1 = require("zod");
// Booking status enum
exports.BookingStatusEnum = zod_1.z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "IN_PROGRESS", "RESCHEDULED"]);
// GeoJSON point validation schema
const geoJSONPointSchema = zod_1.z.object({
    type: zod_1.z.literal("Point"),
    coordinates: zod_1.z.tuple([zod_1.z.number(), zod_1.z.number()]), // [longitude, latitude]
});
// Zod schema for the Booking model
exports.bookingValidationSchema = zod_1.z.object({
    serviceId: zod_1.z.string().min(1, "Service ID is required"),
    providerId: zod_1.z.string().min(1, "Provider ID is required"),
    timeSlotId: zod_1.z.string().min(1, "Time Slot ID is required"),
    scheduledDate: zod_1.z.string().datetime({ message: "Scheduled date must be a valid ISO date" }),
    totalAmount: zod_1.z.number().min(0, "Total amount must be greater than or equal to 0"),
    notes: zod_1.z.string().optional(),
    location: geoJSONPointSchema, // Validates location as GeoJSON Point
});
