"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
    // add service area
    uploadAddress(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, polygon } = req.body;
            // check if provider exist
            const existingProvider = yield prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
            if (!existingProvider) {
                return res.status(404).json({ error: "Service Provider not found" });
            }
            try {
                const serviceArea = yield prisma.serviceArea.create({
                    data: {
                        name,
                        polygon,
                        providerId: existingProvider.id,
                    },
                });
                yield (0, activityLogger_1.logActivity)({
                    userId: req.user.id,
                    action: "Service Area Added.",
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
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error creating service area" });
            }
        });
    }
    // add working hours
    addWorkingHours(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { dayOfWeek, startTime, endTime, breakStart, breakEnd } = req.body;
            // check if provider exist
            const existingProvider = yield prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
            if (!existingProvider) {
                return res.status(404).json({ error: "Service Provider not found" });
            }
            try {
                const workingHours = yield prisma.workingHours.create({
                    data: {
                        dayOfWeek,
                        startTime,
                        endTime,
                        breakStart,
                        breakEnd,
                        providerId: existingProvider.id,
                    },
                });
                yield (0, activityLogger_1.logActivity)({
                    userId: req.user.id,
                    action: "Working Hours Added.",
                    entity: "workingHours",
                    entityId: workingHours.id,
                    details: { dayOfWeek, startTime, endTime, breakStart, breakEnd },
                    req,
                });
                res.status(200).json({
                    workingHours,
                    message: "Working hours created successfully",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error creating working hours" });
            }
        });
    }
    // add date exclusion
    addDateExclusion(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { startDate, endDate, reason } = req.body;
            // check if provider exist
            const existingProvider = yield prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
            if (!existingProvider) {
                return res.status(404).json({ error: "Service Provider not found" });
            }
            try {
                const dateExclusion = yield prisma.dateExclusion.create({
                    data: {
                        startDate,
                        endDate,
                        reason,
                        providerId: existingProvider.id,
                    },
                });
                yield (0, activityLogger_1.logActivity)({
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
        });
    }
    // add service provider schedule
    addSchedule(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { date } = req.body;
            // check if provider exist
            const existingProvider = yield prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
            if (!existingProvider) {
                return res.status(404).json({ error: "Service Provider not found" });
            }
            try {
                const schedule = yield prisma.providerSchedule.create({
                    data: {
                        date,
                        providerId: existingProvider.id,
                    },
                });
                yield (0, activityLogger_1.logActivity)({
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
        });
    }
    // add time slot
    addTimeSlot(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { scheduleId, startTime, endTime } = req.body;
            // check if schedule exist
            const existingSchedule = yield prisma.providerSchedule.findUnique({ where: { id: scheduleId } });
            if (!existingSchedule) {
                return res.status(404).json({ error: "Schedule not found" });
            }
            try {
                const timeSlot = yield prisma.timeSlot.create({
                    data: {
                        startTime,
                        endTime,
                        scheduleId,
                    },
                });
                yield (0, activityLogger_1.logActivity)({
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
        });
    }
};
__decorate([
    (0, route_1.Route)('post', '/add-service-area', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER'])),
    (0, validator_1.Validate)(calendarValidator_1.serviceAreaSchema)
], ServiceProviderController.prototype, "uploadAddress", null);
__decorate([
    (0, route_1.Route)('post', '/add-working-hours', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER'])),
    (0, validator_1.Validate)(calendarValidator_1.workingHoursSchema)
], ServiceProviderController.prototype, "addWorkingHours", null);
__decorate([
    (0, route_1.Route)('post', '/add-date-exclusion', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER'])),
    (0, validator_1.Validate)(calendarValidator_1.dateExclusionSchema)
], ServiceProviderController.prototype, "addDateExclusion", null);
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
