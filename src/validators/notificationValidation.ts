import { z } from "zod";

export const notificationValidationSchema = z.object({
    title: z.string().min(1, "Title is required"),
    titleNp: z.string().optional(),
    message: z.string().min(1, "Message is required"),
    messageNp: z.string().optional(),
    type: z.enum(["BOOKING", "PAYMENT", "SYSTEM", "PROMOTIONAL"]),
    priority: z.enum(["HIGH", "NORMAL", "LOW"]).default("NORMAL"),
    read: z.boolean().default(false),
    readAt: z.string().optional().nullable(), // Should be a valid date-time string
    actionUrl: z.string().optional(),
    image: z.string().optional(),
    data: z.any().optional(),
    expiresAt: z.string().optional().nullable(), // Should be a valid date-time string
});
