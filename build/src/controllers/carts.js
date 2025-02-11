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
    getCartsAdmin(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all categories sorted 
                const categories = yield prisma.cart.findMany({ orderBy: { createdAt: 'desc' } });
                res.status(200).json(categories);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching categories" });
            }
        });
    }
    getCarts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get all categories where isActive is true and sorted boy displayOrder
                const categories = yield prisma.cart.findMany({
                    where: { userId: req.user.id },
                    orderBy: { createdAt: 'desc' },
                });
                res.status(200).json(categories);
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error fetching categories" });
            }
        });
    }
    addToCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { serviceId, quantity } = req.body;
            // check if the quantity is non nagative
            if (quantity < 1) {
                return res.status(400).json({ error: "Quantity should not be less than 1" });
            }
            try {
                const existingCartItem = yield prisma.cart.findFirst({
                    where: {
                        userId: req.user.id,
                        serviceId: serviceId,
                    },
                });
                if (existingCartItem) {
                    res.status(200).json({
                        message: "Service already in cart",
                        cart: existingCartItem,
                    });
                }
                else {
                    const cartItem = yield prisma.cart.create({
                        data: { userId: req.user.id, serviceId, quantity: parseInt(quantity) },
                    });
                    res.status(200).json({ cartItem, message: "Service added to cart" });
                }
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ error: "Error adding service to cart" });
            }
        });
    }
    updateCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { quantity } = req.body;
            try {
                const cartId = req.params.cartId;
                // check if cart item exists
                const existingCartItem = yield prisma.cart.findFirst({
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
                const updatedCartItem = yield prisma.cart.update({
                    where: { id: cartId },
                    data: { quantity: parseInt(quantity) },
                });
                res.status(200).json({ message: "Cart item updated successfully", cart: updatedCartItem });
            }
            catch (error) {
                console.log(error);
                res.status(500).json({ error: "Error updating cart item quantity" });
            }
        });
    }
    deleteCart(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            try {
                yield prisma.cart.delete({ where: { id } });
                res.status(200).json({ message: "Cart deleted successfully" });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ error: "Error deleting cart" });
            }
        });
    }
};
__decorate([
    (0, route_1.Route)('get', '/get-all-admin', (0, authMiddleware_1.checkRole)(['ADMIN']))
], CartController.prototype, "getCartsAdmin", null);
__decorate([
    (0, route_1.Route)('get', '/get', (0, authMiddleware_1.checkRole)(['CUSTOMER']))
], CartController.prototype, "getCarts", null);
__decorate([
    (0, route_1.Route)('post', '/add', (0, authMiddleware_1.checkRole)(['CUSTOMER']))
], CartController.prototype, "addToCart", null);
__decorate([
    (0, route_1.Route)('put', '/update/:cartId', (0, authMiddleware_1.checkRole)(['CUSTOMER'])) // Use the middleware here
], CartController.prototype, "updateCart", null);
__decorate([
    (0, route_1.Route)('delete', '/delete/:id')
], CartController.prototype, "deleteCart", null);
CartController = __decorate([
    (0, controller_1.Controller)('/api/carts')
], CartController);
exports.default = CartController;
