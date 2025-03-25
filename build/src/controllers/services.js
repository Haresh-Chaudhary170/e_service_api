"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const validator_1 = require("../decorators/validator");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMidleware_1 = require("../middleware/uploadMidleware");
const activityLogger_1 = require("../library/activityLogger");
const serviceValidator_1 = require("../validators/serviceValidator");
const prisma = new client_1.PrismaClient();
let ServiceController = class ServiceController {
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
    async getServices(req, res, next) {
        try {
            // Get all services where isActive is true and sorted boy displayOrder
            const services = await prisma.service.findMany({
                where: { isActive: true },
                orderBy: { createdAt: 'desc' },
            });
            // total services
            const total_services = await prisma.service.count();
            res.status(200).json({ services, total_services });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching services" });
        }
    }
    async getServicesAdmin(req, res, next) {
        try {
            const { search, categories, limit = 10, page = 1 } = req.query;
            // Building filters dynamically based on the query params
            const where = {
                isActive: true, // Keep only active services
            };
            // If 'search' query parameter exists, add a search filter
            if (search) {
                where.name = {
                    contains: search,
                    mode: 'insensitive', // Case insensitive search
                };
            }
            // If 'categories' query parameter exists, filter by category
            if (categories) {
                where.category = {
                    in: categories.split(','), // Assuming categories is a comma-separated list
                };
            }
            // Get services with pagination (limit and page)
            const services = await prisma.service.findMany({
                where,
                skip: (parseInt(page) - 1) * parseInt(limit), // Pagination
                take: parseInt(limit), // Limit the number of results
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching services' });
        }
    }
    async addService(req, res, next) {
        const { name, description, price, duration, categoryId, } = req.body;
        // Accessing multiple uploaded files
        const images = req.files;
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
                    providerId: req.user.providerId,
                    categoryId,
                },
            });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "Service Added.",
                entity: "Service",
                entityId: service.id,
                details: { service },
                req,
            });
            // Sending success response
            res.status(201).json(service);
        }
        catch (error) {
            console.error("Error creating service:", error);
            // Sending error response
            res.status(500).json({ error: "Error creating service" });
        }
    }
    async updateService(req, res, next) {
        const { id } = req.params;
        const { name, description, price, duration, categoryId, } = req.body;
        const images = req.files;
        try {
            const service = await prisma.service.findUnique({ where: { id } });
            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }
            const data = {
                name,
                description,
                price: parseFloat(price), // Ensure price is stored as a number
                duration: parseInt(duration, 10), // Ensure duration is stored as an integer
                providerId: req.user.providerId,
                categoryId,
            };
            // get the images in array
            const oldImages = service.images;
            if (images && images.length > 0) {
                data.images = [...oldImages, ...images.map((image) => `${image.destination}/${image.filename}`)];
            }
            // Update the service
            const updatedService = await prisma.service.update({
                where: { id },
                data: data,
            });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "Service Updated.",
                entity: "Service",
                entityId: updatedService.id,
                details: { updatedService },
                req,
            });
            // Send success response
            res.status(200).json({
                updatedService,
                message: "Service updated successfully",
            });
        }
        catch (error) {
            console.error("Error updating service:", error);
            // Send error response
            res.status(500).json({ error: "Error updating service" });
        }
    }
    async deleteService(req, res, next) {
        const { id } = req.params;
        try {
            const service = await prisma.service.findUnique({ where: { id } });
            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }
            // Delete the service with its images
            // const imagePaths = service.images.map((image) => image.replace(`${process.env.UPLOAD_PATH}/`, ''));
            for (const imagePath of service.images) {
                const filePath = path_1.default.join(__dirname, '../../', imagePath);
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
            }
            // Delete the service
            await prisma.service.delete({ where: { id } });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "Service Deleted.",
                entity: "Service",
                entityId: id,
                details: {},
                req,
            });
            res.status(200).json({ message: "Service deleted successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error deleting service" });
        }
    }
    // get services by provider
    async getServicesByProvider(req, res, next) {
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching services" });
        }
    }
    // get single service
    async getSingleService(req, res, next) {
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
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching service" });
        }
    }
    // delete service image
    async deleteServiceImage(req, res, next) {
        const { serviceId, imageName } = req.body;
        try {
            const service = await prisma.service.findUnique({
                where: { id: serviceId },
                select: { images: true }
            });
            if (!service) {
                return res.status(404).json({ error: "Service not found" });
            }
            const imagePath = service.images.find((image) => image.includes(imageName));
            if (!imagePath) {
                return res.status(404).json({ error: "Image not found" });
            }
            // Check if there's only one image left
            if (service.images.length === 1) {
                return res.status(400).json({ error: "Cannot delete the last image" });
            }
            // Delete the image from the images array
            const updatedImages = service.images.filter((image) => !image.includes(imageName));
            // Update the service record in the database
            await prisma.service.update({
                where: { id: serviceId },
                data: { images: updatedImages }
            });
            const filePath = path_1.default.join(__dirname, '../../', imagePath);
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath); // Deletes the file
            }
            res.status(200).json({ message: "Service image deleted successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error deleting service image" });
        }
    }
};
__decorate([
    (0, route_1.Route)('get', '/get-all', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], ServiceController.prototype, "getServices", null);
__decorate([
    (0, route_1.Route)('get', '/get-all-admin', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], ServiceController.prototype, "getServicesAdmin", null);
__decorate([
    (0, route_1.Route)('post', '/add', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']), uploadMidleware_1.multipleUploadMiddleware),
    (0, validator_1.Validate)(serviceValidator_1.serviceValidationSchema)
], ServiceController.prototype, "addService", null);
__decorate([
    (0, route_1.Route)('put', '/update/:id', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']), uploadMidleware_1.multipleUploadMiddleware) // Use the middleware here
], ServiceController.prototype, "updateService", null);
__decorate([
    (0, route_1.Route)('delete', '/delete/:id', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], ServiceController.prototype, "deleteService", null);
__decorate([
    (0, route_1.Route)('get', '/get-by-provider/:providerId')
], ServiceController.prototype, "getServicesByProvider", null);
__decorate([
    (0, route_1.Route)('get', '/get-single/:id')
], ServiceController.prototype, "getSingleService", null);
__decorate([
    (0, route_1.Route)('post', '/delete-image')
], ServiceController.prototype, "deleteServiceImage", null);
ServiceController = __decorate([
    (0, controller_1.Controller)('/api/services')
], ServiceController);
exports.default = ServiceController;
