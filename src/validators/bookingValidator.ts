import { z } from "zod";

// Booking status enum
export const BookingStatusEnum = z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED", "IN_PROGRESS", "RESCHEDULED"]);

// GeoJSON point validation schema
const geoJSONPointSchema = z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});

// Zod schema for the Booking model
export const bookingValidationSchema = z.object({
    addressId: z.string().optional(),
    providerId: z.string().min(1, "Provider ID is required"),
    scheduledDate: z.string().datetime({ message: "Scheduled date must be a valid ISO date" }),
    totalAmount: z.string().min(1, "Total amount must be greater than or equal to 0"),
    notes: z.string().optional(),
});
