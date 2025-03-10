import { Request, Response, NextFunction } from 'express';
import bcrypt from "bcryptjs";
import { Controller } from '../decorators/controller';
import { Route } from '../decorators/route';
import { Validate } from '../decorators/validator';
import { PrismaClient } from "@prisma/client";
import { checkRole } from '../middleware/authMiddleware';
import { multipleUploadMiddleware, singleUploadMiddleware } from '../middleware/uploadMidleware';
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
        select: {
          id: true,
          firstName: true,
          lastName: true,
          role: true,
          email: true,
          phone: true,
        }
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

  @Route('post', '/upload-kyc-certifications', multipleUploadMiddleware)
  async uploadKycAndCertifications(req: Request, res: Response, next: NextFunction) {
    const { providerId, type, name, certifications } = req.body;
    const files = req.files as Express.Multer.File[];

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

      await logActivity({
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

          if (!file) continue;

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
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error uploading KYC and certifications' });
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


  // get user by id
  @Route('get', '/me', checkRole(['CUSTOMER', 'SERVICE_PROVIDER']))
  async getUserById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.user;
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.status(200).json(user); // Return the user object
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching user" });
    }
  } 
// update user
  @Route('put', '/update', checkRole(['CUSTOMER', 'SERVICE_PROVIDER']))
  async updateUser(req: Request, res: Response, next: NextFunction) {
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

      await logActivity({
        userId: user.id,
        action: "User Updated",
        entity: "User",
        entityId: user.id,
        details: { email },
        req,
      })

      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating user" });
    }
  }

  // update user avatar
  @Route('put', '/update-avatar', checkRole(['CUSTOMER', 'SERVICE_PROVIDER']), singleUploadMiddleware)
  async updateAvatar(req: Request, res: Response, next: NextFunction) {
    const { id } = req.user;
    const file = req.file as Express.Multer.File;
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating user avatar" });
    }
  }

  // get all providers
  @Route('get', '/get-all-providers')
  async getAllProviders(req: Request, res: Response, next: NextFunction) {
    try {
      const providers = await prisma.serviceProvider.findMany({
        include: {
          user: true,
          category: true,
        },
        orderBy: {
          user: {
            createdAt: 'desc', // Correct ordering for user.createdAt
          },
        },
      });
      res.status(200).json(providers);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching providers" });
    }
  }

  // GET PROVIDER BY ID
  @Route('get', '/get-provider/:id')
  async getProvider(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching provider" });
    }
  }

  // get provider by id
  @Route('get', '/get-provider-details', checkRole(['SERVICE_PROVIDER','CUSTOMER']))
  async getProviderById(req: Request, res: Response, next: NextFunction) {
    const { id } = req.user;
    try {
      const provider = await prisma.serviceProvider.findFirst({ where: { userId: id } });
      if (!provider) {
        return res.status(404).json({ error: "Provider not found" });
      }
      res.status(200).json(provider); // Return the provider object
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error fetching provider" });
    }
  }

  // update provider
  @Route('put', '/update-provider', checkRole(['SERVICE_PROVIDER']))
  async updateProvider(req: Request, res: Response, next: NextFunction) {
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
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error updating provider" });
    }
  }

  // delete user
  @Route('delete', '/delete/:id', checkRole(['ADMIN', 'SUPERADMIN']))
  async deleteUser(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      // Check if the user exists
      const existingUser = await prisma.user.findUnique({ where: { id } });
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }

      // Delete the user from the database
      await prisma.user.delete({ where: { id } });

      await logActivity({
        userId: req.user.id,
        action: "User Deleted",
        entity: "User",
        entityId: id,
        details: { email: existingUser.email },
        req,
      })

      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error deleting user" });
    }
  }
}


export default UserController;
