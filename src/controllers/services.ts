import { Request, Response, NextFunction } from 'express';
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';
import { multipleUploadMiddleware, singleUploadMiddleware } from '../middleware/uploadMidleware';
import { logActivity } from '../library/activityLogger';
import { serviceValidationSchema } from '../validators/serviceValidator';
const prisma = new PrismaClient();

@Controller('/api/services')
class ServiceController {
    // @Route('get', '/get-all-admin')
    // async getServicesAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    //     try {
    //         // Get all services sorted 
    //         const services = await prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
    //         res.status(200).json(services);
    //     } catch (error) {
    //         console.error(error);
    //         res.status(500).json({ error: "Error fetching services" });
    //     }
    // }

    @Route('get', '/get-all-admin', checkRole(['ADMIN']))
    async getServicesAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, categories, limit = 10, page = 1 } = req.query;

            // Building filters dynamically based on the query params
            const where: any = {
                isActive: true,  // Keep only active services
            };

            // If 'search' query parameter exists, add a search filter
            if (search) {
                where.name = {
                    contains: search as string,
                    mode: 'insensitive',  // Case insensitive search
                };
            }

            // If 'categories' query parameter exists, filter by category
            if (categories) {
                where.category = {
                    in: (categories as string).split(','),  // Assuming categories is a comma-separated list
                };
            }

            // Get services with pagination (limit and page)
            const services = await prisma.service.findMany({
                where,
                skip: (parseInt(page as string) - 1) * parseInt(limit as string), // Pagination
                take: parseInt(limit as string), // Limit the number of results
                orderBy: { createdAt: 'desc' }, // Order by most recent first
                include: {
                    category: true,
                }
            });

            // Count total active services matching the filters
            const total_services = await prisma.service.count({
                where,
            });

            res.status(200).json({ services, total_services });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching services' });
        }
    }

    @Route('get', '/get-all', checkRole(['SERVICE_PROVIDER']))
    async getServices(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, categories, limit = 10, page = 1 } = req.query;

            const provider= await prisma.serviceProvider.findUnique({
                where: {
                    userId: req.user.id
                }
            });
            if (!provider) {
                res.status(400).json({ error: "Provider not found" });
                return;
            }
            // Building filters dynamically based on the query params
            const where: any = {
                isActive: true,  // Keep only active services
                providerId: provider.id
            };

            // If 'search' query parameter exists, add a search filter
            if (search) {
                where.name = {
                    contains: search as string,
                    mode: 'insensitive',  // Case insensitive search
                };
            }

            // If 'categories' query parameter exists, filter by category
            if (categories) {
                where.category = {
                    in: (categories as string).split(','),  // Assuming categories is a comma-separated list
                };
            }

            // Get services with pagination (limit and page)
            const services = await prisma.service.findMany({
                where,
                skip: (parseInt(page as string) - 1) * parseInt(limit as string), // Pagination
                take: parseInt(limit as string), // Limit the number of results
                orderBy: { createdAt: 'desc' }, // Order by most recent first
                include: {
                    category: true,
                }
            });

            // Count total active services matching the filters
            const total_services = await prisma.service.count({
                where,
            });

            res.status(200).json({ services, total_services });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching services' });
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
            categoryId
        } = req.body;

        console.log("Service Add request body", req.body);
        const provider = await prisma.serviceProvider.findUnique({
            where: {
                userId: req.user.id
            },

        });
        if (!provider) {
            return res.status(400).json({ error: "Provider not found" });
        }
       
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
                    providerId: provider.id,
                    categoryId
                },
            });

            console.log("Service created:", service);

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


    @Route('get', '/search')
    async searchServices(req: Request, res: Response) {
        try {
            const {
                search,
                // location,
                minPrice,
                maxPrice,
                category,
                sort,
                // type, // BUSINESS or INDIVIDUAL
                // page = 1,
                // limit = 10
            } = req.query;

            console.log(category)
            // Build the where clause
            // Build the base where clause
            const where: any = {
                isActive: true, // Only active services
                // provider: {
                //     kycStatus: 'APPROVED' // Only services from verified providers
                // }
            };

            // Apply category filter if provided
            if (category && category !== 'all') {
                where.categoryId = category;
            }

            // Apply search filter
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    {
                        provider: {
                            OR: [
                                { businessName: { contains: search, mode: 'insensitive' } },
                                { user: { firstName: { contains: search, mode: 'insensitive' } } },
                                { user: { lastName: { contains: search, mode: 'insensitive' } } }
                            ]
                        }
                    }
                ];
            }

            // Apply location filter
            // if (location) {
            //     where.provider = {
            //         ...where.provider,
            //         serviceAreas: {
            //             some: {
            //                 name: { contains: location as string, mode: 'insensitive' }
            //             }
            //         }
            //     };
            // }

            // Apply price range filter
            if (minPrice || maxPrice) {
                where.price = {
                    gte: Number(minPrice) || 0,
                    lte: Number(maxPrice) || 10000
                };
            }



            let orderBy: any = {};
            switch (sort) {
                case 'top-rated':
                    orderBy = { provider: { averageRating: 'desc' } };
                    break;
                case 'price-low-high':
                    orderBy = { price: 'asc' };
                    break;
                case 'price-high-low':
                    orderBy = { price: 'desc' };
                    break;
                default: // 'nearest'
                    // Default sorting (would need geolocation implementation for actual nearest)
                    orderBy = { createdAt: 'desc' };
            }


            // Get paginated results
            const [services, total] = await prisma.$transaction([
                prisma.service.findMany({
                    where,
                    include: {
                        provider: true,
                        category: true
                    },
                    orderBy,
                    // skip: (Number(page) - 1) * Number(limit),
                    // take: Number(limit),
                }),
                prisma.service.count({ where })
            ]);

            res.json({
                services,
                total,
                // page: Number(page),
                // limit: Number(limit),
                // totalPages: Math.ceil(total / Number(limit))
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching providers' });
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
        } = req.body;
        const provider = await prisma.serviceProvider.findUnique({
            where: {
                userId: req.user.id
            }
        }); 
        if (!provider) {
            return res.status(400).json({ error: "Provider not found" });
        }
        // Validate uploaded files
        const images = req.files as Express.Multer.File[];
        try {
            const service = await prisma.service.findUnique({ where: { id } })
            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }

            const data: any = {
                name,
                description,
                price: parseFloat(price), // Ensure price is stored as a number
                duration: parseInt(duration, 10), // Ensure duration is stored as an integer
                providerId: req.user.providerId,
                categoryId: provider.categoryId, // Category ID can be optional
            }
            console.log("Update service data:", data);
            // get the images in array
            const oldImages = service.images
            if (images && images.length > 0) {
                data.images = [...oldImages, ...images.map((image) => `${image.destination}/${image.filename}`)];
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
            const service = await prisma.service.findUnique({ where: { id } });
            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }
            // Delete the service with its images
            // const imagePaths = service.images.map((image) => image.replace(`${process.env.UPLOAD_PATH}/`, ''));
            for (const imagePath of service.images) {
                const filePath = path.join(__dirname, '../../', imagePath);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            }
            // Delete the service
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

    // get services by provider
    @Route('get', '/get-by-provider/:providerId')
    async getServicesByProvider(req: Request, res: Response, next: NextFunction) {
        const { providerId } = req.params;

        try {
            const services = await prisma.service.findMany({
                where: { providerId },
                include: {
                    provider: true,
                    category: true,
                }
            });
            res.status(200).json(services);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching services" });
        }
    }
    // get single service
    @Route('get', '/get-single/:id')
    async getSingleService(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const service = await prisma.service.findUnique({
                where: { id },
                include: {
                    provider: true,
                    category: true,
                }
            });
            res.status(200).json(service);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching service" });
        }
    }

    // delete service image
    @Route('post', '/delete-image')
    async deleteServiceImage(req: Request, res: Response, next: NextFunction) {
        const { serviceId, imageName } = req.body;

        try {
            const service = await prisma.service.findUnique({
                where: { id: serviceId },
                select: { images: true }
            });

            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }

            const imagePath = service.images.find((image: string) => image.includes(imageName));

            if (!imagePath) {
                return res.status(404).json({ error: "Image not found" });
            }

            // Check if there's only one image left
            if (service.images.length === 1) {
                return res.status(400).json({ error: "Cannot delete the last image" });
            }

            // Delete the image from the images array
            const updatedImages = service.images.filter((image: string) => !image.includes(imageName));

            // Update the service record in the database
            await prisma.service.update({
                where: { id: serviceId },
                data: { images: updatedImages }
            });

            const filePath = path.join(__dirname, '../../', imagePath);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Deletes the file
            }

            res.status(200).json({ message: "Service image deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error deleting service image" });
        }
    }


}

export default ServiceController;
