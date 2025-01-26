import { Request, Response, NextFunction } from 'express';
import bcrypt from "bcryptjs";
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import { PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';
import { singleUploadMiddleware } from '../middleware/uploadMidleware';
import { logActivity } from '../library/activityLogger';
import { addressSchema, customerValidationSchema, providerValidationSchema, userValidationSchema } from '../validators/userValidator';
const prisma = new PrismaClient();



@Controller('/api/users')
class UserController {
  @Route('get', '/get-all')
  // @Route('get', '/get-all', checkRole(['ADMIN', 'SUPERADMIN']))
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await prisma.user.findMany();
      res.status(200).json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching users" });
    }
  }

  @Route('post', '/register')
  @Validate(userValidationSchema) // Validation on the request body
  async registerUser(req: Request, res: Response, next: NextFunction) {
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
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user in the database
      const user = await prisma.user.create({
        data: { firstName, lastName, role, email, phone, password: hashedPassword },
      });
      await logActivity({
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
    } catch (error) {
      console.error(error);  // Log the error for debugging
      res.status(500).json({ error: "Error creating user" });
    }
  }

  // insert to customer table if the registered user role is CUSTOMER
  @Route('post', '/register-customer')
  @Validate(customerValidationSchema) // Validation on the request body
  async registerCustomer(req: Request, res: Response, next: NextFunction) {
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

      await logActivity({
        userId: customer.userId,
        action: `User Registered as Customer`,
        entity: 'Customer',
        entityId: customer.id,
        details: { emergencyContact },
        req,
      })

      res.status(200).json({
        customer,
        message: "Customer created successfully",
      });
    } catch (error) {
      console.error(error);  // Log the error for debugging
      res.status(500).json({ error: "Error creating customer" });
    }
  }

  // insert to provider table if the registered user role is SERVICE_PROVIDER
  @Route('post', '/register-provider')
  @Validate(providerValidationSchema) // Validation on the request body
  async registerProvider(req: Request, res: Response, next: NextFunction) {
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

      await logActivity({
        userId: provider.userId,
        action: `User Registered as Service Provider`,
        entity: 'ServiceProvider',
        entityId: provider.id,
        details: { businessName },
        req,
      })
      res.status(200).json({
        provider,
        message: "Service provider created successfully",
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating service provider" });
    }
  }

  @Route('post', '/upload-kyc-document', checkRole(['SERVICE_PROVIDER']), singleUploadMiddleware)
  // @Validate(providerDocumentSchema)
  async uploadProviderDocument(req: Request, res: Response, next: NextFunction) {

    const { providerId, type, name, metadata } = req.body;
    const image = req.file;

    if (!image) {
      return res.status(400).json({ error: 'Image is required' });
    }

    // Check if providerId exists in the provider table
    const existingProvider = await prisma.serviceProvider.findUnique({
      where: { id: providerId },
    });

    if (!existingProvider) {
      return res.status(404).json({ error: 'Service provider not found' });
    }

    try {
      // Create the provider document in the database
      const document = await prisma.document.create({
        data: {
          providerId,
          type,
          name,
          url: `${image.destination}/${image.filename}`, // Save the full path of the uploaded file
          metadata,
        },
      });
      await logActivity({
        userId: existingProvider.userId,
        action: `Uploaded KYC Document - ${name}`,
        entity: 'Document',
        entityId: document.id,
        details: { type, name },
        req,
      })

      res.status(200).json({
        document,
        message: 'Provider document uploaded successfully',
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error uploading provider document' });
    }
  }

  @Route('post', '/add-address')
  @Validate(addressSchema)
  async uploadAddress(req: Request, res: Response, next: NextFunction) {
    const { userId, type, name, street, area, city, state, zipCode, landmark, location, metadata } = req.body;
    // check if user exist
    const existingUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    try {
      // Create the address in the database
      const address = await prisma.address.create({
        data: { userId, type, name, street, area, city, state, zipCode, landmark, location, metadata },
      });

      await logActivity({
        userId: existingUser.id,
        action: `Added Address - ${name}`,
        entity: 'Address',
        entityId: address.id,
        details: { type, name },
        req,
      })
      res.status(200).json({
        address,
        message: "Address created successfully",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error creating address" });
    }
  }

}

export default UserController;
