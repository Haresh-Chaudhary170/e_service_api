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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const validator_1 = require("../decorators/validator");
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMidleware_1 = require("../middleware/uploadMidleware");
const activityLogger_1 = require("../library/activityLogger");
const userValidator_1 = require("../validators/userValidator");
const prisma = new client_1.PrismaClient();
let UserController = class UserController {
    getUsers(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield prisma.user.findMany();
                res.status(200).json(users);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching users" });
            }
        });
    }
    registerUser(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, role, email, phone, password } = req.body;
            try {
                // Check if the email already exists
                const existingUser = yield prisma.user.findUnique({ where: { email } });
                if (existingUser) {
                    return res.status(400).json({ error: "Email already exists" });
                }
                // Check if the phone number already exists
                const existingUserByPhone = yield prisma.user.findUnique({ where: { phone } });
                if (existingUserByPhone) {
                    return res.status(400).json({ error: "Phone number already exists" });
                }
                // Hash the password before saving it
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                // Create the user in the database
                const user = yield prisma.user.create({
                    data: { firstName, lastName, role, email, phone, password: hashedPassword },
                });
                yield (0, activityLogger_1.logActivity)({
                    userId: user.id,
                    action: `User Registered as ${role}`,
                    entity: 'User',
                    entityId: user.id,
                    details: { email },
                    req,
                });
                res.status(201).json({
                    user,
                    message: "User created successfully",
                });
            }
            catch (error) {
                console.error(error); // Log the error for debugging
                res.status(500).json({ error: "Error creating user" });
            }
        });
    }
    // insert to customer table if the registered user role is CUSTOMER
    registerCustomer(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, emergencyContact } = req.body;
            // check if user exist]
            const existingUser = yield prisma.user.findUnique({ where: { id: userId } });
            if (!existingUser) {
                return res.status(404).json({ error: "User not found" });
            }
            // check if user role is CUSTOMER
            if (existingUser.role !== 'CUSTOMER') {
                return res.status(403).json({ error: "You are not authorized to register as customer" });
            }
            // check if userId already exist in customer table
            const existingCustomer = yield prisma.customer.findUnique({ where: { userId } });
            if (existingCustomer) {
                return res.status(400).json({ error: "You have already been registered as customer" });
            }
            try {
                // Create the customer in the database
                const customer = yield prisma.customer.create({
                    data: { userId, emergencyContact },
                });
                yield (0, activityLogger_1.logActivity)({
                    userId: customer.userId,
                    action: `User Registered as Customer`,
                    entity: 'Customer',
                    entityId: customer.id,
                    details: { emergencyContact },
                    req,
                });
                res.status(200).json({
                    customer,
                    message: "Customer created successfully",
                });
            }
            catch (error) {
                console.error(error); // Log the error for debugging
                res.status(500).json({ error: "Error creating customer" });
            }
        });
    }
    // insert to provider table if the registered user role is SERVICE_PROVIDER
    registerProvider(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, bio, experience, businessName, categoryId } = req.body;
            // check if user exist]
            const existingUser = yield prisma.user.findUnique({ where: { id: userId } });
            if (!existingUser) {
                return res.status(404).json({ error: "User not found" });
            }
            // check if user role is SERVICE_PROVIDER
            if (existingUser.role !== 'SERVICE_PROVIDER') {
                return res.status(403).json({ error: "You are not authorized to register as service provider" });
            }
            // check if userId already exist in provider table
            const existingProvider = yield prisma.serviceProvider.findUnique({ where: { userId } });
            if (existingProvider) {
                return res.status(400).json({ error: "You have already been registered as service provider" });
            }
            try {
                // Create the provider in the database
                const provider = yield prisma.serviceProvider.create({
                    data: { userId, bio, experience, businessName, categoryId },
                });
                yield (0, activityLogger_1.logActivity)({
                    userId: provider.userId,
                    action: `User Registered as Service Provider`,
                    entity: 'ServiceProvider',
                    entityId: provider.id,
                    details: { businessName },
                    req,
                });
                res.status(200).json({
                    provider,
                    message: "Service provider created successfully",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error creating service provider" });
            }
        });
    }
    uploadProviderDocument(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { providerId, type, name, metadata } = req.body;
            const image = req.file;
            if (!image) {
                return res.status(400).json({ error: 'Image is required' });
            }
            // Check if providerId exists in the provider table
            const existingProvider = yield prisma.serviceProvider.findUnique({
                where: { id: providerId },
            });
            if (!existingProvider) {
                return res.status(404).json({ error: 'Service provider not found' });
            }
            try {
                // Create the provider document in the database
                const document = yield prisma.document.create({
                    data: {
                        providerId,
                        type,
                        name,
                        url: `${image.destination}/${image.filename}`, // Save the full path of the uploaded file
                        metadata,
                    },
                });
                yield (0, activityLogger_1.logActivity)({
                    userId: existingProvider.userId,
                    action: `Uploaded KYC Document - ${name}`,
                    entity: 'Document',
                    entityId: document.id,
                    details: { type, name },
                    req,
                });
                res.status(200).json({
                    document,
                    message: 'Provider document uploaded successfully',
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: 'Error uploading provider document' });
            }
        });
    }
    uploadAddress(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { userId, type, name, street, area, city, state, zipCode, landmark, location, metadata } = req.body;
            // check if user exist
            const existingUser = yield prisma.user.findUnique({ where: { id: userId } });
            if (!existingUser) {
                return res.status(404).json({ error: "User not found" });
            }
            try {
                // Create the address in the database
                const address = yield prisma.address.create({
                    data: { userId, type, name, street, area, city, state, zipCode, landmark, location, metadata },
                });
                yield (0, activityLogger_1.logActivity)({
                    userId: existingUser.id,
                    action: `Added Address - ${name}`,
                    entity: 'Address',
                    entityId: address.id,
                    details: { type, name },
                    req,
                });
                res.status(200).json({
                    address,
                    message: "Address created successfully",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error creating address" });
            }
        });
    }
};
__decorate([
    (0, route_1.Route)('get', '/get-all')
    // @Route('get', '/get-all', checkRole(['ADMIN', 'SUPERADMIN']))
], UserController.prototype, "getUsers", null);
__decorate([
    (0, route_1.Route)('post', '/register'),
    (0, validator_1.Validate)(userValidator_1.userValidationSchema) // Validation on the request body
], UserController.prototype, "registerUser", null);
__decorate([
    (0, route_1.Route)('post', '/register-customer'),
    (0, validator_1.Validate)(userValidator_1.customerValidationSchema) // Validation on the request body
], UserController.prototype, "registerCustomer", null);
__decorate([
    (0, route_1.Route)('post', '/register-provider'),
    (0, validator_1.Validate)(userValidator_1.providerValidationSchema) // Validation on the request body
], UserController.prototype, "registerProvider", null);
__decorate([
    (0, route_1.Route)('post', '/upload-kyc-document', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']), uploadMidleware_1.singleUploadMiddleware)
    // @Validate(providerDocumentSchema)
], UserController.prototype, "uploadProviderDocument", null);
__decorate([
    (0, route_1.Route)('post', '/add-address'),
    (0, validator_1.Validate)(userValidator_1.addressSchema)
], UserController.prototype, "uploadAddress", null);
UserController = __decorate([
    (0, controller_1.Controller)('/api/users')
], UserController);
exports.default = UserController;
