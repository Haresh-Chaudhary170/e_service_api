import z from "zod";

export const serviceAreaSchema = z.object({
    name: z.string().min(1), // Name is a required string
    polygon: z.object({}), // GeoJSON polygon validation
});

export const workingHoursSchema = z.object({
    dayOfWeek: z.number().int().min(0).max(6), // Valid day of week (0-6)
    startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid start time. Must be in HH:mm format." }),
    endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid end time. Must be in HH:mm format." }),
    breakStart: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid break start time. Must be in HH:mm format." }).optional(),
    breakEnd: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid break end time. Must be in HH:mm format." }).optional(),
});

export const dateExclusionSchema = z.object({
    startDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "startDate must be a valid date string",
    }),
    endDate: z.string().refine(val => !isNaN(Date.parse(val)), {
        message: "endDate must be a valid date string",
    }),
    reason: z.string().optional(),
});

export const providerScheduleSchema = z.object({
    date: z.string(),
});

export const timeSlotSchema = z.object({
    scheduleId: z.string(),
    startTime: z.string(),
    endTime: z.string(),
});