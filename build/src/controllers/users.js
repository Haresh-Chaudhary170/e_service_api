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
    // @Route('get', '/get-all', checkRole(['ADMIN', 'SUPERADMIN']))
    async getUsers(req, res, next) {
        try {
            const users = await prisma.user.findMany();
            res.status(200).json(users);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching users" });
        }
    }
    async registerUser(req, res, next) {
        const { firstName, lastName, role, email, phone, password } = req.body;
        try {
            // Check if the email already exists
            const existingUser = await prisma.user.findUnique({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ error: "Email already exists" });
            }
            // Check if the phone number already exists
            const existingUserByPhone = await prisma.user.findUnique({ where: { phone } });
            if (existingUserByPhone) {
                return res.status(400).json({ error: "Phone number already exists" });
            }
            // Hash the password before saving it
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            // Create the user in the database
            const user = await prisma.user.create({
                data: { firstName, lastName, role, email, phone, password: hashedPassword },
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    email: true,
                    phone: true,
                }
            });
            await (0, activityLogger_1.logActivity)({
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
    }
    // insert to customer table if the registered user role is CUSTOMER
    async registerCustomer(req, res, next) {
        const { userId, emergencyContact } = req.body;
        // check if user exist]
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        // check if user role is CUSTOMER
        if (existingUser.role !== 'CUSTOMER') {
            return res.status(403).json({ error: "You are not authorized to register as customer" });
        }
        // check if userId already exist in customer table
        const existingCustomer = await prisma.customer.findUnique({ where: { userId } });
        if (existingCustomer) {
            return res.status(400).json({ error: "You have already been registered as customer" });
        }
        try {
            // Create the customer in the database
            const customer = await prisma.customer.create({
                data: { userId, emergencyContact },
            });
            await (0, activityLogger_1.logActivity)({
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
    }
    async registerUserType(req, res, next) {
        const { userId, userType } = req.body;
        // check if user exist]
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        try {
            // Create the customer in the database
            const customer = await prisma.user.update({
                where: { id: userId },
                data: { role: userType },
            });
            await (0, activityLogger_1.logActivity)({
                userId: customer.id,
                action: `User Registered as ` + userType,
                entity: 'Customer',
                entityId: customer.id,
                details: { customer },
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
    }
    // insert to provider table if the registered user role is SERVICE_PROVIDER
    async registerProvider(req, res, next) {
        const { userId, bio, experience, businessName, categoryId } = req.body;
        // check if user exist]
        const existingUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        // check if user role is SERVICE_PROVIDER
        if (existingUser.role !== 'SERVICE_PROVIDER') {
            return res.status(403).json({ error: "You are not authorized to register as service provider" });
        }
        // check if userId already exist in provider table
        const existingProvider = await prisma.serviceProvider.findUnique({ where: { userId } });
        if (existingProvider) {
            return res.status(400).json({ error: "You have already been registered as service provider" });
        }
        try {
            // Create the provider in the database
            const provider = await prisma.serviceProvider.create({
                data: { userId, bio, experience, businessName, categoryId },
            });
            await (0, activityLogger_1.logActivity)({
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
    }
    async uploadKycAndCertifications(req, res, next) {
        const { providerId, type, name, certifications } = req.body;
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ error: 'At least one image is required' });
        }
        // Check if providerId exists in the provider table
        const existingProvider = await prisma.serviceProvider.findUnique({
            where: { id: providerId },
        });
        if (!existingProvider) {
            return res.status(404).json({ error: 'Service provider not found' });
        }
        try {
            // Process KYC Document (First File)
            const kycDocument = await prisma.document.create({
                data: {
                    providerId,
                    type,
                    name,
                    url: `${files[0].destination}/${files[0].filename}`,
                },
            });
            await (0, activityLogger_1.logActivity)({
                userId: existingProvider.userId,
                action: `Uploaded KYC Document - ${name}`,
                entity: 'Document',
                entityId: kycDocument.id,
                details: { type, name },
                req,
            });
            // Process Certifications (Remaining Files)
            const certificationDocs = [];
            if (certifications && Array.isArray(certifications)) {
                for (let i = 0; i < certifications.length; i++) {
                    const cert = certifications[i];
                    const file = files[i + 1]; // Skip the first file since it's for KYC
                    if (!file)
                        continue;
                    const certDoc = await prisma.certification.create({
                        data: {
                            providerId,
                            title: cert.title,
                            issuingOrganization: cert.issuingOrganization,
                            url: `${file.destination}/${file.filename}`,
                        },
                    });
                    certificationDocs.push(certDoc);
                }
            }
            res.status(200).json({
                kycDocument,
                certifications: certificationDocs,
                message: 'KYC and Certifications uploaded successfully',
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error uploading KYC and certifications' });
        }
    }
    async uploadAddress(req, res, next) {
        const { name, phone, street, area, city, state, landmark, location, metadata } = req.body;
        // Check if the user exists
        const existingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        try {
            // Check if an address already exists for the user
            const existingAddress = await prisma.address.findFirst({
                where: { userId: req.user.id },
            });
            let address;
            if (existingAddress) {
                // Update the existing address
                address = await prisma.address.update({
                    where: { id: existingAddress.id },
                    data: { name, phone, street, area, city, state, landmark, location, metadata },
                });
            }
            else {
                // Create a new address
                address = await prisma.address.create({
                    data: { userId: req.user.id, type: "HOME", name, phone, street, area, city, state, landmark, location, metadata },
                });
            }
            // Log the activity
            await (0, activityLogger_1.logActivity)({
                userId: existingUser.id,
                action: existingAddress ? `Updated Address - ${name}` : `Added Address - ${name}`,
                entity: 'Address',
                entityId: address.id,
                details: address,
                req,
            });
            res.status(200).json({
                address,
                message: existingAddress ? "Address updated successfully" : "Address created successfully",
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error processing address" });
        }
    }
    // get address
    async getAddress(req, res, next) {
        // Check if the user exists
        const existingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!existingUser) {
            return res.status(404).json({ error: "User not found" });
        }
        try {
            // Check if an address already exists for the user
            const address = await prisma.address.findFirst({
                where: { userId: req.user.id },
            });
            res.status(200).json({
                address,
                message: "Address fetched successfully",
            });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error processing address" });
        }
    }
    // get user by id
    async getUserById(req, res, next) {
        const { id } = req.user;
        try {
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user); // Return the user object
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching user" });
        }
    }
    // get user by id
    async getUserId(req, res, next) {
        const { id } = req.params;
        try {
            const user = await prisma.user.findUnique({ where: { id } });
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            res.status(200).json(user); // Return the user object
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching user" });
        }
    }
    // update user
    async updateUser(req, res, next) {
        const { id } = req.user;
        const { firstName, lastName, email, phone } = req.body;
        try {
            // Check if the user exists
            const existingUser = await prisma.user.findUnique({ where: { id } });
            if (!existingUser) {
                return res.status(404).json({ error: "User not found" });
            }
            // Update the user in the database
            const user = await prisma.user.update({
                where: { id },
                data: { firstName, lastName, email, phone },
            });
            await (0, activityLogger_1.logActivity)({
                userId: user.id,
                action: "User Updated",
                entity: "User",
                entityId: user.id,
                details: { email },
                req,
            });
            res.status(200).json(user);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error updating user" });
        }
    }
    // update user avatar
    async updateAvatar(req, res, next) {
        const { id } = req.user;
        const file = req.file;
        try {
            // Check if the user exists
            const existingUser = await prisma.user.findUnique({ where: { id } });
            if (!existingUser) {
                return res.status(404).json({ error: "User not found" });
            }
            // Update the user in the database
            const user = await prisma.user.update({
                where: { id },
                data: { avatar: `${file.destination}/${file.filename}` },
            });
            res.status(200).json(user);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error updating user avatar" });
        }
    }
    // get all providers
    async getAllProviderrs(req, res, next) {
        try {
            const providers = await prisma.serviceProvider.findMany({
                include: {
                    user: true,
                    category: true,
                    services: true
                },
                orderBy: {
                    user: {
                        createdAt: 'desc', // Correct ordering for user.createdAt
                    },
                },
            });
            res.status(200).json(providers);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching providers" });
        }
    }
    // GET PROVIDER BY ID
    async getProvider(req, res, next) {
        const { id } = req.params;
        try {
            const provider = await prisma.serviceProvider.findUnique({
                where: { id: id },
                include: {
                    user: true,
                    category: true,
                    serviceAreas: true,
                    services: true,
                    schedules: true,
                    workingHours: true,
                    unavailableDates: true,
                },
            });
            if (!provider) {
                return res.status(404).json({ error: "Provider not found" });
            }
            res.status(200).json(provider);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching provider" });
        }
    }
    async getProviderss(req, res, next) {
        try {
            const provider = await prisma.serviceProvider.findMany({
                include: {
                    user: true,
                    category: true,
                    serviceAreas: true,
                    services: true,
                    schedules: true,
                    workingHours: true,
                    unavailableDates: true,
                },
            });
            if (!provider) {
                return res.status(404).json({ error: "Provider not found" });
            }
            res.status(200).json(provider);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching provider" });
        }
    }
    // get provider by id
    async getProviderById(req, res, next) {
        const { id } = req.user;
        try {
            const provider = await prisma.serviceProvider.findFirst({ where: { userId: id } });
            if (!provider) {
                return res.status(404).json({ error: "Provider not found" });
            }
            res.status(200).json(provider); // Return the provider object
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching provider" });
        }
    }
    // update provider
    async updateProvider(req, res, next) {
        const { id } = req.user;
        const { bio, experience, businessName, categoryId } = req.body;
        try {
            // Check if the provider exists
            const existingProvider = await prisma.serviceProvider.findFirst({ where: { userId: id } });
            if (!existingProvider) {
                return res.status(404).json({ error: "Provider not found" });
            }
            // Update the provider in the database
            const provider = await prisma.serviceProvider.update({
                where: { id: existingProvider.id },
                data: { bio, experience, businessName, categoryId },
            });
            res.status(200).json(provider);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error updating provider" });
        }
    }
    // delete user
    async deleteUser(req, res, next) {
        const { id } = req.params;
        try {
            // Check if the user exists
            const existingUser = await prisma.user.findUnique({ where: { id } });
            if (!existingUser) {
                return res.status(404).json({ error: "User not found" });
            }
            // Delete the user from the database
            await prisma.user.delete({ where: { id } });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "User Deleted",
                entity: "User",
                entityId: id,
                details: { email: existingUser.email },
                req,
            });
            res.status(200).json({ message: "User deleted successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error deleting user" });
        }
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
    (0, route_1.Route)('post', '/register-user-type'),
    (0, validator_1.Validate)(userValidator_1.customerValidationSchema) // Validation on the request body
], UserController.prototype, "registerUserType", null);
__decorate([
    (0, route_1.Route)('post', '/register-provider'),
    (0, validator_1.Validate)(userValidator_1.providerValidationSchema) // Validation on the request body
], UserController.prototype, "registerProvider", null);
__decorate([
    (0, route_1.Route)('post', '/upload-kyc-certifications', uploadMidleware_1.multipleUploadMiddleware)
], UserController.prototype, "uploadKycAndCertifications", null);
__decorate([
    (0, route_1.Route)('post', '/add-address', (0, authMiddleware_1.checkRole)(["CUSTOMER"])),
    (0, validator_1.Validate)(userValidator_1.addressSchema)
], UserController.prototype, "uploadAddress", null);
__decorate([
    (0, route_1.Route)('get', '/get-address', (0, authMiddleware_1.checkRole)(["CUSTOMER"]))
], UserController.prototype, "getAddress", null);
__decorate([
    (0, route_1.Route)('get', '/me', (0, authMiddleware_1.checkRole)(['CUSTOMER', 'SERVICE_PROVIDER']))
], UserController.prototype, "getUserById", null);
__decorate([
    (0, route_1.Route)('get', '/id/:id')
], UserController.prototype, "getUserId", null);
__decorate([
    (0, route_1.Route)('put', '/update', (0, authMiddleware_1.checkRole)(['CUSTOMER', 'SERVICE_PROVIDER']))
], UserController.prototype, "updateUser", null);
__decorate([
    (0, route_1.Route)('put', '/update-avatar', (0, authMiddleware_1.checkRole)(['CUSTOMER', 'SERVICE_PROVIDER']), uploadMidleware_1.singleUploadMiddleware)
], UserController.prototype, "updateAvatar", null);
__decorate([
    (0, route_1.Route)('get', '/get-all-providers')
], UserController.prototype, "getAllProviderrs", null);
__decorate([
    (0, route_1.Route)('get', '/get-provider/:id')
], UserController.prototype, "getProvider", null);
__decorate([
    (0, route_1.Route)('get', '/get-providerss')
], UserController.prototype, "getProviderss", null);
__decorate([
    (0, route_1.Route)('get', '/get-provider-details', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER', 'CUSTOMER']))
], UserController.prototype, "getProviderById", null);
__decorate([
    (0, route_1.Route)('put', '/update-provider', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], UserController.prototype, "updateProvider", null);
__decorate([
    (0, route_1.Route)('delete', '/delete/:id', (0, authMiddleware_1.checkRole)(['ADMIN', 'SUPERADMIN']))
], UserController.prototype, "deleteUser", null);
UserController = __decorate([
    (0, controller_1.Controller)('/api/users')
], UserController);
exports.default = UserController;
