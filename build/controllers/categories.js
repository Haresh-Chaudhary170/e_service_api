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
const zod_1 = require("zod"); // Importing Zod
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const uploadMidleware_1 = require("../middleware/uploadMidleware");
const activityLogger_1 = require("../library/activityLogger");
const prisma = new client_1.PrismaClient();
const categoryValidationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    nameNp: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    descriptionNp: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
let CategoryController = class CategoryController {
    getCategoriesAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all categories sorted by displayOrder
                const categories = yield prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
                res.status(200).json(categories);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching categories" });
            }
        });
    }
    getCategories(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all categories where isActive is true and sorted boy displayOrder
                const categories = yield prisma.category.findMany({
                    where: { isActive: true },
                    orderBy: { displayOrder: 'asc' },
                });
                res.status(200).json(categories);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching categories" });
            }
        });
    }
    addCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { name, nameNp, description, descriptionNp, parentId } = req.body;
            const image = req.file;
            if (!name) {
                return res.status(400).json({ error: "Name is required" });
            }
            try {
                const category = yield prisma.category.create({
                    data: {
                        name,
                        nameNp,
                        description,
                        descriptionNp,
                        image: image ? `${image.destination}/${image.filename}` : undefined,
                        parentId,
                    },
                });
                yield (0, activityLogger_1.logActivity)({
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
        });
    }
    updateCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { name, nameNp, description, descriptionNp, icon, parentId } = req.body;
            const image = req.file;
            if (!name) {
                return res.status(400).json({ error: "Name is required" });
            }
            try {
                const data = {
                    name,
                    nameNp,
                    description,
                    descriptionNp,
                    icon,
                    parentId,
                };
                if (image) {
                    data.image = `${image.destination}/${image.filename}`;
                }
                const category = yield prisma.category.update({
                    where: { id },
                    data: data,
                });
                yield (0, activityLogger_1.logActivity)({
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
        });
    }
    deleteCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma.category.delete({ where: { id } });
                yield (0, activityLogger_1.logActivity)({
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
        });
    }
    // get single category
    getSingleCategory(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                const category = yield prisma.category.findUnique({ where: { id } });
                res.status(200).json(category);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching category" });
            }
        });
    }
};
__decorate([
    (0, route_1.Route)('get', '/get-all-admin')
], CategoryController.prototype, "getCategoriesAdmin", null);
__decorate([
    (0, route_1.Route)('get', '/get-all')
], CategoryController.prototype, "getCategories", null);
__decorate([
    (0, route_1.Route)('post', '/add', (0, authMiddleware_1.checkRole)(['ADMIN']), uploadMidleware_1.singleUploadMiddleware),
    (0, validator_1.Validate)(categoryValidationSchema)
], CategoryController.prototype, "addCategory", null);
__decorate([
    (0, route_1.Route)('put', '/update/:id', uploadMidleware_1.singleUploadMiddleware) // Use the middleware here
], CategoryController.prototype, "updateCategory", null);
__decorate([
    (0, route_1.Route)('delete', '/delete/:id')
], CategoryController.prototype, "deleteCategory", null);
__decorate([
    (0, route_1.Route)('get', '/get-single/:id')
], CategoryController.prototype, "getSingleCategory", null);
CategoryController = __decorate([
    (0, controller_1.Controller)('/api/categories')
], CategoryController);
exports.default = CategoryController;
