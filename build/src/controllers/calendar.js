"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const validator_1 = require("../decorators/validator");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const activityLogger_1 = require("../library/activityLogger");
const calendarValidator_1 = require("../validators/calendarValidator");
const prisma = new client_1.PrismaClient();
let ServiceProviderController = class ServiceProviderController {
    // add or update service area
    async uploadAddress(req, res, next) {
        const { name, polygon } = req.body;
        // check if provider exists
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
        if (!existingProvider) {
            return res.status(404).json({ error: "Service Provider not found" });
        }
        try {
            // Use findFirst instead of findUnique to handle non-unique providerId
            const existingServiceArea = await prisma.serviceArea.findFirst({
                where: {
                    providerId: existingProvider.id, // Checking if a service area exists for the provider
                },
            });
            let serviceArea;
            if (existingServiceArea) {
                // If the service area exists, update it
                serviceArea = await prisma.serviceArea.update({
                    where: {
                        id: existingServiceArea.id, // Use the existing service area's ID for the update
                    },
                    data: {
                        name, // Update the name
                        polygon, // Update the polygon
                    },
                });
                // Log activity for update
                await (0, activityLogger_1.logActivity)({
                    userId: req.user.id,
                    action: "Service Area Updated",
                    entity: "serviceArea",
                    entityId: serviceArea.id,
                    details: { name },
                    req,
                });
                res.status(200).json({
                    serviceArea,
                    message: "Service area updated successfully",
                });
            }
            else {
                // If the service area doesn't exist, create it
                serviceArea = await prisma.serviceArea.create({
                    data: {
                        name, // Create with the new name
                        polygon, // Create with the new polygon
                        providerId: existingProvider.id,
                    },
                });
                // Log activity for creation
                await (0, activityLogger_1.logActivity)({
                    userId: req.user.id,
                    action: "Service Area Added",
                    entity: "serviceArea",
                    entityId: serviceArea.id,
                    details: { name },
                    req,
                });
                res.status(200).json({
                    serviceArea,
                    message: "Service area created successfully",
                });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating or updating service area" });
        }
    }
    // get service area
    async getServiceAreas(req, res, next) {
        // check if provider exist
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
        if (!existingProvider) {
            return res.status(404).json({ error: "Service Provider not found" });
        }
        try {
            const serviceAreas = await prisma.serviceArea.findFirst({
                where: {
                    providerId: existingProvider.id,
                },
            });
            // get service area count
            // const total_serviceAreas = await prisma.serviceArea.count({
            //     where: {
            //         providerId: existingProvider.id,
            //     },
            // });
            res.status(200).json({
                serviceAreas,
                // total_serviceAreas,
                message: "Service areas retrieved successfully",
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error retrieving service areas" });
        }
    }
    // // add working hours
    // @Route('post', '/add-working-hours', checkRole(['SERVICE_PROVIDER']))
    // @Validate(workingHoursSchema)
    // async addWorkingHours(req: Request, res: Response, next: NextFunction) {
    //     const { dayOfWeek, startTime, endTime, breakStart, breakEnd } = req.body;
    //     // check if provider exist
    //     const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
    //     if (!existingProvider) {
    //         return res.status(404).json({ error: "Service Provider not found" });
    //     }
    //     try {
    //         const workingHours = await prisma.workingHours.create({
    //             data: {
    //                 dayOfWeek,
    //                 startTime,
    //                 endTime,
    //                 breakStart,
    //                 breakEnd,
    //                 providerId: existingProvider.id,
    //             },
    //         });
    //         await logActivity({
    //             userId: req.user.id,
    //             action: "Working Hours Added.",
    //             entity: "workingHours",
    //             entityId: workingHours.id,
    //             details: { dayOfWeek, startTime, endTime, breakStart, breakEnd },
    //             req,
    //         })
    //         res.status(200).json({
    //             workingHours,
    //             message: "Working hours created successfully",
    //         });
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ error: "Error creating working hours" });
    //     }
    // }
    async addWorkingHours(req, res, next) {
        const { id, dayOfWeek, startTime, endTime, breakStart, breakEnd } = req.body;
        // Check if the provider exists
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
        if (!existingProvider) {
            return res.status(404).json({ error: "Service Provider not found" });
        }
        try {
            let workingHours;
            if (id) {
                // Update existing working hours
                workingHours = await prisma.workingHours.update({
                    where: { id },
                    data: {
                        dayOfWeek,
                        startTime,
                        endTime,
                        breakStart,
                        breakEnd,
                    },
                });
                await (0, activityLogger_1.logActivity)({
                    userId: req.user.id,
                    action: "Working Hours Updated.",
                    entity: "workingHours",
                    entityId: workingHours.id,
                    details: { dayOfWeek, startTime, endTime, breakStart, breakEnd },
                    req,
                });
            }
            else {
                // Create new working hours
                workingHours = await prisma.workingHours.create({
                    data: {
                        dayOfWeek,
                        startTime,
                        endTime,
                        breakStart,
                        breakEnd,
                        providerId: existingProvider.id,
                    },
                });
                await (0, activityLogger_1.logActivity)({
                    userId: req.user.id,
                    action: "Working Hours Added.",
                    entity: "workingHours",
                    entityId: workingHours.id,
                    details: { dayOfWeek, startTime, endTime, breakStart, breakEnd },
                    req,
                });
            }
            res.status(200).json({
                workingHours,
                message: id ? "Working hours updated successfully" : "Working hours created successfully",
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error saving working hours" });
        }
    }
    // get working hours
    async getWorkingHours(req, res, next) {
        // check if provider exist
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
        if (!existingProvider) {
            return res.status(404).json({ error: "Service Provider not found" });
        }
        try {
            const workingHours = await prisma.workingHours.findMany({
                where: {
                    providerId: existingProvider.id,
                },
            });
            res.status(200).json({
                workingHours,
                message: "Working hours retrieved successfully",
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error retrieving working hours" });
        }
    }
    // add date exclusion
    async addDateExclusion(req, res, next) {
        const { startDate, endDate, reason } = req.body;
        // check if provider exist
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
        if (!existingProvider) {
            return res.status(404).json({ error: "Service Provider not found" });
        }
        try {
            const dateExclusion = await prisma.dateExclusion.create({
                data: {
                    startDate,
                    endDate,
                    reason,
                    providerId: existingProvider.id,
                },
            });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "Date Exclusion Added.",
                entity: "dateExclusion",
                entityId: dateExclusion.id,
                details: { startDate, endDate, reason },
                req,
            });
            res.status(200).json({
                dateExclusion,
                message: "Date exclusion created successfully",
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating date exclusion" });
        }
    }
    // get date exclusion
    async getDateExclusions(req, res, next) {
        // check if provider exist
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
        if (!existingProvider) {
            return res.status(404).json({ error: "Service Provider not found" });
        }
        try {
            const dateExclusions = await prisma.dateExclusion.findMany({
                where: {
                    providerId: existingProvider.id,
                },
            });
            // get date exclusion count
            const total_dateExclusions = await prisma.dateExclusion.count({
                where: {
                    providerId: existingProvider.id,
                },
            });
            res.status(200).json({
                dateExclusions,
                total_dateExclusions,
                message: "Date exclusions retrieved successfully",
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error retrieving date exclusions" });
        }
    }
    // add service provider schedule
    async addSchedule(req, res, next) {
        const { date } = req.body;
        // check if provider exist
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
        if (!existingProvider) {
            return res.status(404).json({ error: "Service Provider not found" });
        }
        try {
            const schedule = await prisma.providerSchedule.create({
                data: {
                    date,
                    providerId: existingProvider.id,
                },
            });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "Schedule Added.",
                entity: "providerSchedule",
                entityId: schedule.id,
                details: { date },
                req,
            });
            res.status(200).json({
                schedule,
                message: "Schedule created successfully",
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating schedule" });
        }
    }
    // add time slot
    async addTimeSlot(req, res, next) {
        const { scheduleId, startTime, endTime } = req.body;
        // check if schedule exist
        const existingSchedule = await prisma.providerSchedule.findUnique({ where: { id: scheduleId } });
        if (!existingSchedule) {
            return res.status(404).json({ error: "Schedule not found" });
        }
        try {
            const timeSlot = await prisma.timeSlot.create({
                data: {
                    startTime,
                    endTime,
                    scheduleId,
                },
            });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "Time Slot Added.",
                entity: "timeSlot",
                entityId: timeSlot.id,
                details: { startTime, endTime, scheduleId },
                req,
            });
            res.status(200).json({
                timeSlot,
                message: "Time slot created successfully",
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating time slot" });
        }
    }
};
__decorate([
    (0, route_1.Route)('post', '/add-service-area', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER'])),
    (0, validator_1.Validate)(calendarValidator_1.serviceAreaSchema)
], ServiceProviderController.prototype, "uploadAddress", null);
__decorate([
    (0, route_1.Route)('get', '/get-service-area', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], ServiceProviderController.prototype, "getServiceAreas", null);
__decorate([
    (0, route_1.Route)('post', '/add-working-hours', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER'])),
    (0, validator_1.Validate)(calendarValidator_1.workingHoursSchema)
], ServiceProviderController.prototype, "addWorkingHours", null);
__decorate([
    (0, route_1.Route)('get', '/get-working-hours', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], ServiceProviderController.prototype, "getWorkingHours", null);
__decorate([
    (0, route_1.Route)('post', '/add-date-exclusion', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER'])),
    (0, validator_1.Validate)(calendarValidator_1.dateExclusionSchema)
], ServiceProviderController.prototype, "addDateExclusion", null);
__decorate([
    (0, route_1.Route)('get', '/get-date-exclusion', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], ServiceProviderController.prototype, "getDateExclusions", null);
__decorate([
    (0, route_1.Route)('post', '/add-schedule', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER'])),
    (0, validator_1.Validate)(calendarValidator_1.providerScheduleSchema)
], ServiceProviderController.prototype, "addSchedule", null);
__decorate([
    (0, route_1.Route)('post', '/add-time-slot', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER'])),
    (0, validator_1.Validate)(calendarValidator_1.timeSlotSchema)
], ServiceProviderController.prototype, "addTimeSlot", null);
ServiceProviderController = __decorate([
    (0, controller_1.Controller)('/api/calendar')
], ServiceProviderController);
exports.default = ServiceProviderController;
