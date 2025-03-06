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
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const categoryValidationSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  nameNp: z.string().optional(),
  description: z.string().optional(),
  descriptionNp: z.string().optional(),
  image: z.string().optional(),
});


@Controller('/api/categories')
class CategoryController {
  @Route('get', '/get-all-admin')
  async getCategoriesAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, limit = 10, page = 1 } = req.query;

      // Building filters dynamically based on the query params
      const where: any = {
        isActive: true,  // Keep only active categories
      };

      // If 'search' query parameter exists, add a search filter
      if (search) {
        where.name = {
          contains: search as string,
          mode: 'insensitive',  // Case insensitive search
        };
      }

      // Get categories with pagination (limit and page)
      const categories = await prisma.category.findMany({
        where,
        skip: (parseInt(page as string) - 1) * parseInt(limit as string), // Pagination
        take: parseInt(limit as string), // Limit the number of results
        orderBy: { createdAt: 'desc' }, // Order by most recent first
      });

      // Count total active categories matching the filters
      const total_categories = await prisma.category.count({
        where,
      });

      res.status(200).json({ categories, total_categories });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error fetching categories' });
    }
  }

  @Route('get', '/get-all', checkRole(['SERVICE_PROVIDER']))
  async getCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get all categories where isActive is true and sorted boy displayOrder
      const categories = await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
      });
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching categories" });
    }
  }

  @Route('post', '/add', checkRole(['SERVICE_PROVIDER']), singleUploadMiddleware)
  @Validate(categoryValidationSchema)
  async addCategory(req: Request, res: Response, next: NextFunction) {
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
      await logActivity({
        userId: req.user.id,
        action: "Category Added",
        entity: "Category",
        entityId: category.id,
        details: { name },
        req,
      })
      res.status(200).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating category" });
    }
  }

  @Route('put', '/update/:id', checkRole(['SERVICE_PROVIDER']), singleUploadMiddleware) // Use the middleware here
  async updateCategory(req: Request, res: Response, next: NextFunction) {
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

      const data: any = {
        name,
        nameNp,
        description,
        descriptionNp,
        icon,
        parentId,
      }
      if (image) {
        // Delete existing image if it exists
        const filePath = existingCategory.image ? path.join(__dirname, '../../', existingCategory.image) : '';
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Deletes the file
        }

        data.image = `${image.destination}/${image.filename}`;
      }
      const category = await prisma.category.update({
        where: { id },
        data: data,
      });
      await logActivity({
        userId: req.user.id,
        action: "Category Updated",
        entity: "Category",
        entityId: category.id,
        details: { name },
        req,
      })
      res.status(200).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating category" });
    }
  }

  @Route('delete', '/delete/:id', checkRole(['SERVICE_PROVIDER']))
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      // Check if the category exists
      const existingCategory = await prisma.category.findUnique({ where: { id } });
      if (!existingCategory) {
        return res.status(404).json({ error: "Category not found" });
      }

      // Delete existing image if it exists
      const filePath = existingCategory.image ? path.join(__dirname, '../../', existingCategory.image) : '';
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath); // Deletes the file
      }

      // Delete the category from the database
      await prisma.category.delete({ where: { id } });
      await logActivity({
        userId: req.user.id,
        action: "Category Deleted",
        entity: "Category",
        entityId: id,
        details: { id },
        req,
      })
      res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting category" });
    }
  }

  // get single category
  @Route('get', '/get-single/:id')
  async getSingleCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      const category = await prisma.category.findUnique({ where: { id } });
      res.status(200).json(category);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching category" });
    }
  }

}

export default CategoryController;
