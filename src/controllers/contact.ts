import { Request, Response, NextFunction } from 'express';
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';
import z from 'zod';
import { Validate } from '../decorators/validator';
import { resolve } from 'path';

const prisma = new PrismaClient();

const contactValidationSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    subject: z.string().min(1, "Subject is required"),
    message: z.string().min(1, "Message is required"),
});

@Controller('/api/contact')
class ContactController {

    @Route('post', '/support')
    @Validate(contactValidationSchema) // Validation on the request body
    async postContact(req: Request, res: Response, next: NextFunction) {
        const { name, email, subject, message } = req.body;
        try {
            const contact = await prisma.contact.create({
                data: {
                    name,
                    email,
                    subject,
                    message
                }
            })
            res.status(200).json({ contact, message: "Query Submitted Successfully!" });

        } catch (error) {
            res.status(500).json({ error: "Error submitting contact" });

        }
    }
    @Route('get', '/get-all')
    async getCategoriesAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { search, limit = 10, page = 1 } = req.query;

            // Building filters dynamically based on the query params
            const where: any = {
                resolved: false,  // Keep only active categories
            };

            if (search) {
                where.OR = [
                    { name: { contains: search as string, mode: 'insensitive' } },
                    { email: { contains: search as string, mode: 'insensitive' } },
                    { subject: { contains: search as string, mode: 'insensitive' } },
                    { message: { contains: search as string, mode: 'insensitive' } }
                ];
            }

            // Get categories with pagination (limit and page)
            const support = await prisma.contact.findMany({
                where,
                skip: (parseInt(page as string) - 1) * parseInt(limit as string), // Pagination
                take: parseInt(limit as string), // Limit the number of results
                orderBy: { createdAt: 'desc' }, // Order by most recent first
            });

            // Count total active categories matching the filters
            const total_support = await prisma.contact.count({
                where,
            });

            res.status(200).json({ support, total_support });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Error fetching support ticket' });
        }
    }

    // get single log
    @Route('get', '/get-by-id/:id', checkRole(['ADMIN', 'CUSTOMER', 'SERVICE_PROVIDER']))
    async getcontact(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;

        try {
            const contact = await prisma.contact.findUnique({ where: { id } });
            if (!contact) {
                return res.status(404).json({ error: "contact not found" });
            }
            res.status(200).json(contact);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error fetching contact" });
        }
    }
}

export default ContactController;