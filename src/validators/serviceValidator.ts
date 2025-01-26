import z from "zod";

export const serviceValidationSchema = z.object({
    name: z.string().min(1, "Name is required"), // The name should be a non-empty string
    description: z.string().min(1, "Description is required"), // The description should also be a non-empty string
    price: z.string().min(1, "Price must be a positive number"), // Price should be a positive number
    duration: z.string().min(1, "Duration must be a positive integer"), // Duration should be an integer greater than 0
    providerId: z.string().min(1, "Provider ID is required"),
    categoryId: z.string().min(1, "Service ID is required"),
});