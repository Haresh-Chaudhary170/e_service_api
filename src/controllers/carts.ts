import { Request, Response, NextFunction } from 'express';
import bcrypt from "bcryptjs";
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import { z } from 'zod';  // Importing Zod

import { PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';
import { singleUploadMiddleware } from '../middleware/uploadMidleware';
import { logActivity } from '../library/activityLogger';
import { error } from 'console';
const prisma = new PrismaClient();

const cartValidationSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    nameNp: z.string().optional(),
    description: z.string().optional(),
    descriptionNp: z.string().optional(),
    image: z.string().optional(),
});


@Controller('/api/carts')
class CartController {
    @Route('get', '/get-all-admin', checkRole(['ADMIN']))
    async getCartsAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // Get all categories sorted 
            const categories = await prisma.cart.findMany({ orderBy: { createdAt: 'desc' } });
            res.status(200).json(categories);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching categories" });
        }
    }

    @Route('get', '/get/:provider', checkRole(['CUSTOMER']))
    async getCarts(req: Request, res: Response, next: NextFunction): Promise<void> {
        const providerId = req.params.provider;

        try {
            // Get all carts where isActive is true and sorted boy displayOrder
            const carts = await prisma.cart.findMany({
                where: { userId: req.user.id, providerId },
                include:{
                    service:true
                },
                orderBy: { createdAt: 'desc' },
            });
            res.status(200).json(carts);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching carts" });
        }
    }

    @Route('post', '/add', checkRole(['CUSTOMER']))
    async addToCart(req: Request, res: Response, next: NextFunction) {
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
                })
            }
            const cartItem = await prisma.cart.create({
                data: { userId: req.user.id, serviceId, quantity: parseInt(quantity), providerId },
            });

            return res.status(200).json({ cartItem, message: "Service added to cart" });


        } catch (error) {
            console.log(error);
            return res.status(500).json({ error: "Error adding service to cart" });

        }
    }

    @Route('put', '/update/:cartId', checkRole(['CUSTOMER'])) // Use the middleware here
    async updateCart(req: Request, res: Response, next: NextFunction) {
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


        } catch (error) {
            console.log(error);
            res.status(500).json({ error: "Error updating cart item quantity" });

        }
    }

    @Route('delete', '/delete/:id', checkRole(['CUSTOMER']))
    async deleteCart(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            await prisma.cart.delete({ where: { id } });
            res.status(200).json({ message: "Cart deleted successfully" });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error deleting cart" });
        }
    }
}

export default CartController;
