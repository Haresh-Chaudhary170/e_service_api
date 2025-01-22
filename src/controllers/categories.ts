import { Request, Response, NextFunction } from 'express';
import bcrypt from "bcryptjs";
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import { z } from 'zod';  // Importing Zod

import { PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';
import { singleUpload } from '../middleware/uploadMidleware';
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
      // Get all categories sorted by displayOrder
      const categories = await prisma.category.findMany({ orderBy: { displayOrder: 'asc' } });
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching categories" });
    }
  }

  @Route('get', '/get-all')
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

  @Route('post', '/add', checkRole(['ADMIN']))
  // @Validate(categoryValidationSchema) // Validation on the request body
  async addCategory(req: Request, res: Response, next: NextFunction) {
    singleUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      const { name, nameNp, description, descriptionNp, parentId } = req.body;
      // check if name exist
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      const image = req.file;

      try {
        const category = await prisma.category.create({
          data: {
            name,
            nameNp,
            description,
            descriptionNp,
            image: `${image?.destination}/${image?.filename}`,
            parentId,
          },
        });
        res.status(201).json(category);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error creating category" });
      }
    }
    )
  }

  @Route('put', '/update/:id')
  // @Validate(categoryValidationSchema) // Validation on the request body
  async updateCategory(req: Request, res: Response, next: NextFunction) {
    singleUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }
      const { id } = req.params;
      const { name, nameNp, description, descriptionNp, icon, parentId } = req.body;
      // check if name exist
      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }
      const image = req.file;

      try {
        const category = await prisma.category.update({
          where: { id },
          data: {
            name,
            nameNp,
            description,
            descriptionNp,
            icon,
            image: image && `${image?.destination}/${image?.filename}`,
            parentId,
          },
        });
        res.status(200).json(category);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error updating category" });
      }
    }
    )
  }

  @Route('delete', '/delete/:id')
  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;

    try {
      await prisma.category.delete({ where: { id } });
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
