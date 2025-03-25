"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../decorators/controller");
const route_1 = require("../decorators/route");
const zod_1 = require("zod"); // Importing Zod
const client_1 = require("@prisma/client");
const authMiddleware_1 = require("../middleware/authMiddleware");
const prisma = new client_1.PrismaClient();
const cartValidationSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Name is required'),
    nameNp: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    descriptionNp: zod_1.z.string().optional(),
    image: zod_1.z.string().optional(),
});
let CartController = class CartController {
    async getCartsAdmin(req, res, next) {
        try {
            // Get all categories sorted 
            const categories = await prisma.cart.findMany({ orderBy: { createdAt: 'desc' } });
            res.status(200).json(categories);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching categories" });
        }
    }
    async getCarts(req, res, next) {
        const providerId = req.params.provider;
        try {
            // Get all carts where isActive is true and sorted boy displayOrder
            const carts = await prisma.cart.findMany({
                where: { userId: req.user.id, providerId },
                include: {
                    service: true
                },
                orderBy: { createdAt: 'desc' },
            });
            res.status(200).json(carts);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching carts" });
        }
    }
    async addToCart(req, res, next) {
        const { serviceId, quantity, providerId } = req.body;
        // check if the quantity is non nagative
        if (quantity < 1) {
            return res.status(400).json({ error: "Quantity should not be less than 1" });
        }
        try {
            const existingCartItem = await prisma.cart.findFirst({
                where: {
                    userId: req.user.id,
                    serviceId: serviceId,
                },
            });
            if (existingCartItem) {
                return res.status(400).json({
                    error: "Service already in cart",
                });
            }
            const cartItem = await prisma.cart.create({
                data: { userId: req.user.id, serviceId, quantity: parseInt(quantity), providerId },
            });
            return res.status(200).json({ cartItem, message: "Service added to cart" });
        }
        catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error adding service to cart" });
        }
    }
    async updateCart(req, res, next) {
        const { quantity } = req.body;
        try {
            const cartId = req.params.cartId;
            // check if cart item exists
            const existingCartItem = await prisma.cart.findFirst({
                where: { id: cartId },
            });
            if (!existingCartItem) {
                res.status(404).json({ error: "Cart item not found" });
            }
            // check if the quantity is non nagative
            if (quantity < 1) {
                return res.status(400).json({ error: "Quantity should not be less than 1" });
            }
            // update cart item quantity  and return the updated item
            const updatedCartItem = await prisma.cart.update({
                where: { id: cartId },
                data: { quantity: parseInt(quantity) },
            });
            res.status(200).json({ message: "Cart item updated successfully", cart: updatedCartItem });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error updating cart item quantity" });
        }
    }
    async deleteCart(req, res, next) {
        const { id } = req.params;
        try {
            await prisma.cart.delete({ where: { id } });
            res.status(200).json({ message: "Cart deleted successfully" });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error deleting cart" });
        }
    }
};
__decorate([
    (0, route_1.Route)('get', '/get-all-admin', (0, authMiddleware_1.checkRole)(['ADMIN']))
], CartController.prototype, "getCartsAdmin", null);
__decorate([
    (0, route_1.Route)('get', '/get/:provider', (0, authMiddleware_1.checkRole)(['CUSTOMER']))
], CartController.prototype, "getCarts", null);
__decorate([
    (0, route_1.Route)('post', '/add', (0, authMiddleware_1.checkRole)(['CUSTOMER']))
], CartController.prototype, "addToCart", null);
__decorate([
    (0, route_1.Route)('put', '/update/:cartId', (0, authMiddleware_1.checkRole)(['CUSTOMER'])) // Use the middleware here
], CartController.prototype, "updateCart", null);
__decorate([
    (0, route_1.Route)('delete', '/delete/:id', (0, authMiddleware_1.checkRole)(['CUSTOMER']))
], CartController.prototype, "deleteCart", null);
CartController = __decorate([
    (0, controller_1.Controller)('/api/carts')
], CartController);
exports.default = CartController;
