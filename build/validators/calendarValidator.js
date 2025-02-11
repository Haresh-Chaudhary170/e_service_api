"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeSlotSchema = exports.providerScheduleSchema = exports.dateExclusionSchema = exports.workingHoursSchema = exports.serviceAreaSchema = void 0;
const zod_1 = __importDefault(require("zod"));
exports.serviceAreaSchema = zod_1.default.object({
    name: zod_1.default.string().min(1), // Name is a required string
    polygon: zod_1.default.object({}), // GeoJSON polygon validation
});
exports.workingHoursSchema = zod_1.default.object({
    dayOfWeek: zod_1.default.number().int().min(0).max(6), // Valid day of week (0-6)
    startTime: zod_1.default.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid start time. Must be in HH:mm format." }),
    endTime: zod_1.default.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid end time. Must be in HH:mm format." }),
    breakStart: zod_1.default.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid break start time. Must be in HH:mm format." }).optional(),
    breakEnd: zod_1.default.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid break end time. Must be in HH:mm format." }).optional(),
});
exports.dateExclusionSchema = zod_1.default.object({
    startDate: zod_1.default.string().refine(val => !isNaN(Date.parse(val)), {
        message: "startDate must be a valid date string",
    }),
    endDate: zod_1.default.string().refine(val => !isNaN(Date.parse(val)), {
        message: "endDate must be a valid date string",
    }),
    reason: zod_1.default.string().optional(),
});
exports.providerScheduleSchema = zod_1.default.object({
    date: zod_1.default.string(),
});
exports.timeSlotSchema = zod_1.default.object({
    scheduleId: zod_1.default.string(),
    startTime: zod_1.default.string(),
    endTime: zod_1.default.string(),
});
