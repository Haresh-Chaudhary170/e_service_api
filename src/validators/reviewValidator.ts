import { z } from "zod";

export const reviewValidationSchema = z.object({
    serviceId: z.string().min(1, "Service ID is required"),
    rating: z.string().min(1, "Rating must be at least 1").max(5, "Rating cannot exceed 5"),
    comment: z.string().optional(),
    images: z.array(z.string().url()).optional(),

});
