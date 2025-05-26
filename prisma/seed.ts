
// prisma/seed.ts
import { PrismaClient, UserRole, UserStatus, VerificationStatus, DocumentType } from '@prisma/client';
import { hashSync } from 'bcryptjs';

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    console.log('🌱 Starting seed process...');

    // ======================
    // 1. Create Admin User
    // ======================
    const admin = await prisma.user.create({
        data: {
            email: 'admin@yopreety.com',
            password: hashSync('SecureAdminPass123!', SALT_ROUNDS),
            role: UserRole.ADMIN,
            firstName: 'System',
            lastName: 'Admin',
            status: UserStatus.ACTIVE,
            emailVerified: true,
        },
    });
    console.log(`🔑 Admin user created: ${admin.email}`);

    // ======================
    // 2. Seed Categories
    // ======================
    const categories = await prisma.category.createMany({
        data: [
            {
                name: 'Hair Care',
                nameNp: 'कपाल हेरचाह',
                description: 'Professional hair treatments and styling',
                icon: 'scissors',
                // image: '/public/sample/images/categories/HairCare.jpg',
                isActive: true,
                displayOrder: 1
            },
            {
                name: 'Skin Care',
                nameNp: 'छाला हेरचाह',
                description: 'Facials and skin treatments',
                icon: 'face',
                // image: '/public/sample/images/categories/SkinCare.jpg',
                isActive: true,
                displayOrder: 2
            },
            {
                name: 'Nail Art',
                nameNp: 'नङ्ग्रे डिजाइन',
                description: 'Creative nail designs and treatments',
                icon: 'nail-polish',
                // image: '/public/sample/images/categories/NailArt.jpg',
                isActive: true,
                displayOrder: 3
            },
            {
                name: 'Makeup',
                nameNp: 'मेकअप',
                description: 'Professional makeup services',
                icon: 'makeup',
                // image: '/public/sample/images/categories/Makeup.jpg',
                isActive: true,
                displayOrder: 4
            }
        ]
    });
    console.log(`📚 Created ${categories.count} categories`);

    // // ======================
    // // 3. Create Service Providers
    // // ======================
    // const providerData = [
    //   {
    //     firstName: 'Anjali',
    //     lastName: 'Shrestha',
    //     email: 'anjali@beauty.com',
    //     phone: '+9779841234567',
    //     businessName: 'Anjali Beauty Studio',
    //     bio: 'Certified makeup artist with 5 years experience',
    //     experience: 5,
    //     category: 'Hair Care'
    //   },
    //   {
    //     firstName: 'Rina',
    //     lastName: 'Gurung',
    //     email: 'rina@nails.com',
    //     phone: '+9779856789012',
    //     businessName: 'Rina Nail Studio',
    //     bio: 'Nail art specialist with 3 years experience',
    //     experience: 3,
    //     category: 'Nail Art'
    //   },
    //   {
    //     firstName: 'Priyanka',
    //     lastName: 'Thapa',
    //     email: 'priyanka@skincare.com',
    //     phone: '+9779812345678',
    //     businessName: 'Glow Skincare',
    //     bio: 'Specialized in facial treatments and skin rejuvenation',
    //     experience: 4,
    //     category: 'Skin Care'
    //   }
    // ];

    // for (const provider of providerData) {
    //   const category = await prisma.category.findFirstOrThrow({
    //     where: { name: provider.category }
    //   });

    //   const user = await prisma.user.create({
    //     data: {
    //       email: provider.email,
    //       phone: provider.phone,
    //       password: hashSync('ProviderPass123!', SALT_ROUNDS),
    //       role: UserRole.SERVICE_PROVIDER,
    //       firstName: provider.firstName,
    //       lastName: provider.lastName,
    //       status: UserStatus.ACTIVE,
    //       emailVerified: true,
    //       providerProfile: {
    //         create: {
    //           bio: provider.bio,
    //           experience: provider.experience,
    //           businessName: provider.businessName,
    //           categoryId: category.id,
    //           kycStatus: VerificationStatus.APPROVED,
    //           documents: {
    //             create: {
    //               type: DocumentType.ID_PROOF,
    //               name: 'Citizenship Certificate',
    //               url: 'https://yopreety.com/docs/citizenship.pdf',
    //               verificationStatus: VerificationStatus.APPROVED
    //             }
    //           },
    //           workingHours: {
    //             create: [
    //               { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Monday
    //               { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' }, // Tuesday
    //               { dayOfWeek: 4, startTime: '10:00', endTime: '20:00' }, // Thursday
    //               { dayOfWeek: 5, startTime: '10:00', endTime: '20:00' }  // Friday
    //             ]
    //           }
    //         }
    //       }
    //     }
    //   });
    //   console.log(`💇 Provider created: ${user.email}`);
    // }

    // // ======================
    // // 4. Create Customers
    // // ======================
    // const customerData = [
    //   {
    //     firstName: 'Sarita',
    //     lastName: 'Gurung',
    //     email: 'sarita@customer.com',
    //     phone: '+9779865432109'
    //   },
    //   {
    //     firstName: 'Priya',
    //     lastName: 'Shakya',
    //     email: 'priya@customer.com',
    //     phone: '+9779876543210'
    //   },
    //   {
    //     firstName: 'Arun',
    //     lastName: 'Tamang',
    //     email: 'arun@customer.com',
    //     phone: '+9779845678901'
    //   }
    // ];

    // for (const customer of customerData) {
    //   const user = await prisma.user.create({
    //     data: {
    //       email: customer.email,
    //       phone: customer.phone,
    //       password: hashSync('CustomerPass123!', SALT_ROUNDS),
    //       role: UserRole.CUSTOMER,
    //       firstName: customer.firstName,
    //       lastName: customer.lastName,
    //       status: UserStatus.ACTIVE,
    //       emailVerified: true,
    //       customerProfile: {
    //         create: {
    //           emergencyContact: '+9779800000001'
    //         }
    //       },
    //       address: {
    //         create: {
    //           type: 'HOME',
    //           name: 'Primary Address',
    //           street: 'New Baneshwor',
    //           phone: customer.phone,
    //           city: 'Kathmandu',
    //           state: 'Bagmati',
    //           location: {
    //             type: 'Point',
    //             coordinates: [85.3320, 27.6932]
    //           },
    //           isDefault: true,
    //           isVerified: true
    //         }
    //       }
    //     }
    //   });
    //   console.log(`👩 Customer created: ${user.email}`);
    // }

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });