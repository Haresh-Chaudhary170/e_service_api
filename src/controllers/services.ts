import { Request, Response, NextFunction } from 'express';
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import { z } from 'zod';  // Importing Zod

import { PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';
import { multipleUploadMiddleware, singleUploadMiddleware } from '../middleware/uploadMidleware';
import { logActivity } from '../library/activityLogger';
import { serviceValidationSchema } from '../validators/serviceValidator';
const prisma = new PrismaClient();

@Controller('/api/services')
class ServiceController {
    @Route('get', '/get-all-admin')
    async getServicesAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Get all services sorted 
            const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
            res.status(200).json(services);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching services" });
        }
    }

    @Route('get', '/get-all')
    async getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Get all services where isActive is true and sorted boy displayOrder
            const services = await prisma.service.findMany({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
            });
            res.status(200).json(services);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching services" });
        }
    }

    @Route('post', '/add', checkRole(['SERVICE_PROVIDER']), multipleUploadMiddleware)
    @Validate(serviceValidationSchema)
    async addService(req: Request, res: Response, next: NextFunction) {
        const {
            name,
            description,
            price,
            duration,
            providerId,
            categoryId,
        } = req.body;

        // Accessing multiple uploaded files
        const images = req.files as Express.Multer.File[];
        // Validate uploaded files
        if (!images || images.length === 0) {
            return res.status(400).json({ error: "At least one image is required" });
        }

        const validMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
        const maxFileSize = 5 * 1024 * 1024; // 5 MB
        const maxFileCount = 5;

        if (images.length > maxFileCount) {
            return res
                .status(400)
                .json({ error: `You can upload a maximum of ${maxFileCount} images` });
        }

        for (const file of images) {
            if (!validMimeTypes.includes(file.mimetype)) {
                return res
                    .status(400)
                    .json({ error: `Invalid file type: ${file.originalname}` });
            }
            if (file.size > maxFileSize) {
                return res
                    .status(400)
                    .json({ error: `File too large: ${file.originalname}` });
            }
        }

        try {
            // Creating the service
            const service = await prisma.service.create({
                data: {
                    name,
                    description,
                    price: parseFloat(price), // Ensure price is stored as a number
                    duration: parseInt(duration, 10), // Ensure duration is stored as an integer
                    isActive: true,
                    images: images ? images.map((image) => `${image.destination}/${image.filename}`) : [],
                    providerId,
                    categoryId,
                },
            });

            await logActivity({
                userId: req.user.id,
                action: "Service Added.",
                entity: "Service",
                entityId: service.id,
                details: { service },
                req,
            })

            // Sending success response
            res.status(201).json(service);
        } catch (error) {
            console.error("Error creating service:", error);

            // Sending error response
            res.status(500).json({ error: "Error creating service" });
        }
    }


    @Route('put', '/update/:id', checkRole(['SERVICE_PROVIDER']), multipleUploadMiddleware) // Use the middleware here
    async updateService(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const {
            name,
            description,
            price,
            duration,
            providerId,
            categoryId,
        } = req.body;
        const images = req.files as Express.Multer.File[];
        try {
            const data: any = {
                name,
                description,
                price: parseFloat(price), // Ensure price is stored as a number
                duration: parseInt(duration, 10), // Ensure duration is stored as an integer
                providerId,
                categoryId,
            }
            if (images && images.length > 0) {
                data.images = images.map((image) => `${image.destination}/${image.filename}`);
            }
            // Update the service
            const updatedService = await prisma.service.update({
                where: { id },
                data: data,
            });
            await logActivity({
                userId: req.user.id,
                action: "Service Updated.",
                entity: "Service",
                entityId: updatedService.id,
                details: { updatedService },
                req,
            })
            // Send success response
            res.status(200).json({
                updatedService,
                message: "Service updated successfully",
            });
        } catch (error) {
            console.error("Error updating service:", error);

            // Send error response
            res.status(500).json({ error: "Error updating service" });
        }

    }

    @Route('delete', '/delete/:id', checkRole(['SERVICE_PROVIDER']))
    async deleteService(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            await prisma.service.delete({ where: { id } });
            await logActivity({
                userId: req.user.id,
                action: "Service Deleted.",
                entity: "Service",
                entityId: id,
                details: {},
                req,
            })
            res.status(200).json({ message: "Service deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error deleting service" });
        }
    }

    // get single service
    @Route('get', '/get-single/:id')
    async getSingleService(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const service = await prisma.service.findUnique({
                where: { id },
                include:{
                    provider: true,
                    category: true,
                    bookings: true
                }
            });
            res.status(200).json(service);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching service" });
        }
    }

}

export default ServiceController;
