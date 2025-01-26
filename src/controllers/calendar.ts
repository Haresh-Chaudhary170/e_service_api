import { Request, Response, NextFunction } from 'express';
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import { z } from 'zod';  // Importing Zod

import { PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';
import { logActivity } from '../library/activityLogger';
import { dateExclusionSchema, providerScheduleSchema, serviceAreaSchema, timeSlotSchema, workingHoursSchema } from '../validators/calendarValidator';
const prisma = new PrismaClient();



@Controller('/api/calendar')
class ServiceProviderController {
    // add service area
    @Route('post', '/add-service-area',checkRole(['SERVICE_PROVIDER']))
    @Validate(serviceAreaSchema)
    async uploadAddress(req: Request, res: Response, next: NextFunction) {
        const { name, polygon } = req.body;
        // check if provider exist
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
        if (!existingProvider) {
            return res.status(404).json({ error: "Service Provider not found" });
        }
        try {
            const serviceArea = await prisma.serviceArea.create({
                data: {
                    name,
                    polygon,
                    providerId:existingProvider.id,
                },
            });
            await logActivity({
                userId: req.user.id,
                action: "Service Area Added.",
                entity: "serviceArea",
                entityId: serviceArea.id,
                details: { name },
                req,
            })
            res.status(200).json({
                serviceArea,
                message: "Service area created successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating service area" });
        }
    }

    // add working hours
    @Route('post', '/add-working-hours', checkRole(['SERVICE_PROVIDER']))
    @Validate(workingHoursSchema)
    async addWorkingHours(req: Request, res: Response, next: NextFunction) {
        const { dayOfWeek, startTime, endTime, breakStart, breakEnd } = req.body;
        // check if provider exist
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId: req.user.id } });
        if (!existingProvider) {
            return res.status(404).json({ error: "Service Provider not found" });
        }

        try {
            const workingHours = await prisma.workingHours.create({
                data: {
                    dayOfWeek,
                    startTime,
                    endTime,
                    breakStart,
                    breakEnd,
                    providerId: existingProvider.id,
                },
            });
            await logActivity({
                userId: req.user.id,
                action: "Working Hours Added.",
                entity: "workingHours",
                entityId: workingHours.id,
                details: { dayOfWeek, startTime, endTime, breakStart, breakEnd },
                req,
            })
            res.status(200).json({
                workingHours,
                message: "Working hours created successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating working hours" });
        }
    }
    // add date exclusion
    @Route('post', '/add-date-exclusion', checkRole(['SERVICE_PROVIDER']))
    @Validate(dateExclusionSchema)
    async addDateExclusion(req: Request, res: Response, next: NextFunction) {
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
                    providerId:existingProvider.id,
                },
            });
            await logActivity({
                userId: req.user.id,
                action: "Date Exclusion Added.",
                entity: "dateExclusion",
                entityId: dateExclusion.id,
                details: { startDate, endDate, reason },
                req,
            })
            res.status(200).json({
                dateExclusion,
                message: "Date exclusion created successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating date exclusion" });
        }
    }

    // add service provider schedule
    @Route('post', '/add-schedule', checkRole(['SERVICE_PROVIDER']))
    @Validate(providerScheduleSchema)
    async addSchedule(req: Request, res: Response, next: NextFunction) {
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
                    providerId:existingProvider.id,
                },
            });
            await logActivity({
                userId: req.user.id,
                action: "Schedule Added.",
                entity: "providerSchedule",
                entityId: schedule.id,
                details: { date },
                req,
            })
            res.status(200).json({
                schedule,
                message: "Schedule created successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating schedule" });
        }
    }

    // add time slot
    @Route('post', '/add-time-slot', checkRole(['SERVICE_PROVIDER']))
    @Validate(timeSlotSchema)
    async addTimeSlot(req: Request, res: Response, next: NextFunction) {
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
            await logActivity({
                userId: req.user.id,
                action: "Time Slot Added.",
                entity: "timeSlot",
                entityId: timeSlot.id,
                details: { startTime, endTime, scheduleId },
                req,
            })
            res.status(200).json({
                timeSlot,
                message: "Time slot created successfully",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating time slot" });
        }
    }

}

export default ServiceProviderController;
