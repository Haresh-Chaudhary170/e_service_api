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
const uploadMidleware_1 = require("../middleware/uploadMidleware");
const activityLogger_1 = require("../library/activityLogger");
const serviceValidator_1 = require("../validators/serviceValidator");
const prisma = new client_1.PrismaClient();
let ServiceController = class ServiceController {
    getServicesAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all services sorted 
                const services = yield prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
                res.status(200).json(services);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching services" });
            }
        });
    }
    getServices(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all services where isActive is true and sorted boy displayOrder
                const services = yield prisma.service.findMany({
                    where: { isActive: true },
                    orderBy: { createdAt: 'desc' },
                });
                res.status(200).json(services);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching services" });
            }
        });
    }
    addService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, description, price, duration, providerId, categoryId, } = req.body;
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
                const service = yield prisma.service.create({
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
                yield (0, activityLogger_1.logActivity)({
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
        });
    }
    updateService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, description, price, duration, providerId, categoryId, } = req.body;
            const images = req.files;
            try {
                const data = {
                    name,
                    description,
                    price: parseFloat(price), // Ensure price is stored as a number
                    duration: parseInt(duration, 10), // Ensure duration is stored as an integer
                    providerId,
                    categoryId,
                };
                if (images && images.length > 0) {
                    data.images = images.map((image) => `${image.destination}/${image.filename}`);
                }
                // Update the service
                const updatedService = yield prisma.service.update({
                    where: { id },
                    data: data,
                });
                yield (0, activityLogger_1.logActivity)({
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
        });
    }
    deleteService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma.service.delete({ where: { id } });
                yield (0, activityLogger_1.logActivity)({
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
        });
    }
    // get services by provider
    getServicesByProvider(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { providerId } = req.params;
            try {
                const services = yield prisma.service.findMany({
                    where: { providerId },
                    include: {
                        provider: true,
                        category: true,
                        bookings: true
                    }
                });
                res.status(200).json(services);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching services" });
            }
        });
    }
    // get single service
    getSingleService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const service = yield prisma.service.findUnique({
                    where: { id },
                    include: {
                        provider: true,
                        category: true,
                        bookings: true
                    }
                });
                res.status(200).json(service);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching service" });
            }
        });
    }
};
__decorate([
    (0, route_1.Route)('get', '/get-all-admin')
], ServiceController.prototype, "getServicesAdmin", null);
__decorate([
    (0, route_1.Route)('get', '/get-all')
], ServiceController.prototype, "getServices", null);
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
ServiceController = __decorate([
    (0, controller_1.Controller)('/api/services')
], ServiceController);
exports.default = ServiceController;
