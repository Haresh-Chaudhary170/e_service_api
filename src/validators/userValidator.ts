import z from "zod";

export const userValidationSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    role: z.enum(['CUSTOMER', 'SERVICE_PROVIDER', 'ADMIN']),
    email: z.string().email("Invalid email format"),
    phone: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d{10}$/, 'Phone number must contain only digits'),
    password: z.string().min(6, "Password must be at least 6 characters"),
});

export const customerValidationSchema = z.object({
    userId: z.string().min(1, "Missing user id"),
    emergencyContact: z.string().length(10, 'Phone number must be exactly 10 digits').regex(/^\d{10}$/, 'Phone number must contain only digits').optional(),
});

export const providerValidationSchema = z.object({
    userId: z.string().min(1, "Missing user id"),
    bio: z.string().min(20, "Minimum character is 20.").optional(),
    experience: z.number().int().nonnegative().optional(), // Experience is an integer and non-negative
    businessName: z.string().nullable().optional(), // Business name is optional and can be null
    categoryId: z.string().min(1, "Category is missing!")
})

export const providerDocumentSchema = z.object({
    providerId: z.string().min(1, "Service provider id required!"),
    type: z.enum(["ID_PROOF", "CERTIFICATION", "Driving_LICENSE", "PASSPORT", "VOTER_ID_CARD", "PAN_CARD", "OTHER"]),
    name: z.string().min(1, "Name requiired"),
    //image as file
    image: z.string(),
    metadata: z.string().optional(),
});

export const addressSchema = z.object({
    userId: z.string(),
    type: z.enum(['HOME', 'OFFICE', 'OTHER']),
    name: z.string().min(1, 'Address label is required'),
    street: z.string().min(1, 'Street address is required'),
    area: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().optional(),
    landmark: z.string().optional(),
    location: z.string(),
    metadata: z.unknown().optional()
});
