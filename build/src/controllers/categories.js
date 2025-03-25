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
const zod_1 = require("zod"); // Importing Zod
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMidleware_1 = require("../middleware/uploadMidleware");
const activityLogger_1 = require("../library/activityLogger");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const prisma = new client_1.PrismaClient();
const categoryValidationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    nameNp: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    descriptionNp: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
let CategoryController = class CategoryController {
    async getCategoriesAdmin(req, res, next) {
        try {
            const { search, limit = 10, page = 1 } = req.query;
            // Building filters dynamically based on the query params
            const where = {
                isActive: true, // Keep only active categories
            };
            // If 'search' query parameter exists, add a search filter
            if (search) {
                where.name = {
                    contains: search,
                    mode: 'insensitive', // Case insensitive search
                };
            }
            // Get categories with pagination (limit and page)
            const categories = await prisma.category.findMany({
                where,
                skip: (parseInt(page) - 1) * parseInt(limit), // Pagination
                take: parseInt(limit), // Limit the number of results
                orderBy: { createdAt: 'desc' }, // Order by most recent first
            });
            // Count total active categories matching the filters
            const total_categories = await prisma.category.count({
                where,
            });
            res.status(200).json({ categories, total_categories });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching categories' });
        }
    }
    async getCategories(req, res, next) {
        try {
            // Get all categories where isActive is true and sorted boy displayOrder
            const categories = await prisma.category.findMany({
                where: { isActive: true },
                orderBy: { displayOrder: 'asc' },
            });
            res.status(200).json(categories);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching categories" });
        }
    }
    async addCategory(req, res, next) {
        const { name, nameNp, description, descriptionNp, parentId } = req.body;
        const image = req.file;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        try {
            const category = await prisma.category.create({
                data: {
                    name,
                    nameNp,
                    description,
                    descriptionNp,
                    image: image ? `${image.destination}/${image.filename}` : undefined,
                    parentId,
                },
            });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "Category Added",
                entity: "Category",
                entityId: category.id,
                details: { name },
                req,
            });
            res.status(200).json(category);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error creating category" });
        }
    }
    async updateCategory(req, res, next) {
        const { id } = req.params;
        const { name, nameNp, description, descriptionNp, icon, parentId } = req.body;
        const image = req.file;
        if (!name) {
            return res.status(400).json({ error: "Name is required" });
        }
        try {
            // Check if the category exists
            const existingCategory = await prisma.category.findUnique({ where: { id } });
            if (!existingCategory) {
                return res.status(404).json({ error: "Category not found" });
            }
            const data = {
                name,
                nameNp,
                description,
                descriptionNp,
                icon,
                parentId,
            };
            if (image) {
                // Delete existing image if it exists
                const filePath = existingCategory.image ? path_1.default.join(__dirname, '../../', existingCategory.image) : '';
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath); // Deletes the file
                }
                data.image = `${image.destination}/${image.filename}`;
            }
            const category = await prisma.category.update({
                where: { id },
                data: data,
            });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "Category Updated",
                entity: "Category",
                entityId: category.id,
                details: { name },
                req,
            });
            res.status(200).json(category);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error updating category" });
        }
    }
    async deleteCategory(req, res, next) {
        const { id } = req.params;
        try {
            // Check if the category exists
            const existingCategory = await prisma.category.findUnique({ where: { id } });
            if (!existingCategory) {
                return res.status(404).json({ error: "Category not found" });
            }
            // Delete existing image if it exists
            const filePath = existingCategory.image ? path_1.default.join(__dirname, '../../', existingCategory.image) : '';
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath); // Deletes the file
            }
            // Delete the category from the database
            await prisma.category.delete({ where: { id } });
            await (0, activityLogger_1.logActivity)({
                userId: req.user.id,
                action: "Category Deleted",
                entity: "Category",
                entityId: id,
                details: { id },
                req,
            });
            res.status(200).json({ message: "Category deleted successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error deleting category" });
        }
    }
    // get single category
    async getSingleCategory(req, res, next) {
        const { id } = req.params;
        try {
            const category = await prisma.category.findUnique({ where: { id } });
            res.status(200).json(category);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching category" });
        }
    }
};
__decorate([
    (0, route_1.Route)('get', '/get-all-admin')
], CategoryController.prototype, "getCategoriesAdmin", null);
__decorate([
    (0, route_1.Route)('get', '/get-all')
], CategoryController.prototype, "getCategories", null);
__decorate([
    (0, route_1.Route)('post', '/add', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']), uploadMidleware_1.singleUploadMiddleware),
    (0, validator_1.Validate)(categoryValidationSchema)
], CategoryController.prototype, "addCategory", null);
__decorate([
    (0, route_1.Route)('put', '/update/:id', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']), uploadMidleware_1.singleUploadMiddleware) // Use the middleware here
], CategoryController.prototype, "updateCategory", null);
__decorate([
    (0, route_1.Route)('delete', '/delete/:id', (0, authMiddleware_1.checkRole)(['SERVICE_PROVIDER']))
], CategoryController.prototype, "deleteCategory", null);
__decorate([
    (0, route_1.Route)('get', '/get-single/:id')
], CategoryController.prototype, "getSingleCategory", null);
CategoryController = __decorate([
    (0, controller_1.Controller)('/api/categories')
], CategoryController);
exports.default = CategoryController;
