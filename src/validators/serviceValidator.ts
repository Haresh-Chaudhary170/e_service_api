import z from "zod";

export const serviceValidationSchema = z.object({
    name: z.string().min(1, "Name is required"), // The name should be a non-empty string
    description: z.string().min(1, "Description is required"), // The description should also be a non-empty string
    price: z.string(),
    duration: z.string(), // Duration should be an integer greater than 0
    categoryId: z.string().min(1, "Category ID is required"),
});