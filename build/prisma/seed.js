"use strict";
// // prisma/seed.js
// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();
// const bcrypt = require('bcryptjs');
Object.defineProperty(exports, "__esModule", { value: true });
// async function main() {
//     console.log('Seeding database...');
//   const hashedPassword = await bcrypt.hash('hary123', 10);
//     // Seed Users
//     const users = [
//         {
//             email: 'customer1@example.com',
//             phone: '1234567890',
//             password: hashedPassword, // Replace with an actual hash
//             role: 'CUSTOMER',
//             firstName: 'John',
//             lastName: 'Doe',
//             status: 'ACTIVE'
//         },
//         {
//             email: 'provider1@example.com',
//             phone: '0987654321',
//             password: hashedPassword, // Replace with an actual hash
//             role: 'SERVICE_PROVIDER',
//             firstName: 'Jane',
//             lastName: 'Smith',
//             status: 'ACTIVE'
//         },
//         {
//             email: 'hareshchaudhary250@gmail.com',
//             phone: '9860689987',
//             password: hashedPassword, // Replace with an actual hash
//             role: 'ADMIN',
//             firstName: 'Alice',
//             lastName: 'Johnson',
//             status: 'ACTIVE'
//         }
//     ];
//     for (const user of users) {
//         await prisma.user.upsert({
//             where: { email: user.email },
//             update: {},
//             create: user
//         });
//     }
//     // Seed Categories
//     const categories = [
//         {
//             name: 'Plumbing',
//             description: 'Services related to plumbing and water systems.'
//         },
//         {
//             name: 'Electrical',
//             description: 'Services related to electrical repairs and installations.'
//         },
//         {
//             name: 'Cleaning',
//             description: 'Home and office cleaning services.'
//         }
//     ];
//     for (const category of categories) {
//         await prisma.category.upsert({
//             where: { name: category.name },
//             update: {},
//             create: category
//         });
//     }
//     // Seed Services
//     const services = [
//         {
//             name: 'Leaky Faucet Repair',
//             description: 'Fixing leaky faucets quickly and efficiently.',
//             price: 50,
//             duration: 30,
//             provider: { connect: { userId: (await prisma.user.findFirst({ where: { email: 'provider1@example.com' } })).id } },
//             category: { connect: { name: 'Plumbing' } }
//         },
//         {
//             name: 'Wiring Installation',
//             description: 'Expert wiring installation for homes and offices.',
//             price: 150,
//             duration: 120,
//             provider: { connect: { userId: (await prisma.user.findFirst({ where: { email: 'provider1@example.com' } })).id } },
//             category: { connect: { name: 'Electrical' } }
//         },
//         {
//             name: 'Deep Cleaning',
//             description: 'Comprehensive cleaning for residential spaces.',
//             price: 200,
//             duration: 240,
//             provider: { connect: { userId: (await prisma.user.findFirst({ where: { email: 'provider1@example.com' } })).id } },
//             category: { connect: { name: 'Cleaning' } }
//         }
//     ];
//     for (const service of services) {
//         await prisma.service.create({ data: service });
//     }
//     console.log('Seeding completed!');
// }
// main()
//     .catch((e) => {
//         console.error(e);
//         process.exit(1);
//     })
//     .finally(async () => {
//         await prisma.$disconnect();
//     });
// prisma/seed.ts
const client_1 = require("@prisma/client");
const bcryptjs_1 = require("bcryptjs");
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
async function main() {
    console.log('🌱 Starting seed process...');
    // ======================
    // 1. Create Admin User
    // ======================
    const admin = await prisma.user.create({
        data: {
            email: 'admin@yopreety.com',
            password: (0, bcryptjs_1.hashSync)('SecureAdminPass123!', SALT_ROUNDS),
            role: client_1.UserRole.ADMIN,
            firstName: 'System',
            lastName: 'Admin',
            status: client_1.UserStatus.ACTIVE,
            emailVerified: true,
        }
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
                isActive: true,
                displayOrder: 1
            },
            {
                name: 'Skin Care',
                nameNp: 'छाला हेरचाह',
                description: 'Facials and skin treatments',
                icon: 'face',
                isActive: true,
                displayOrder: 2
            },
            {
                name: 'Nail Art',
                nameNp: 'नङ्ग्रे डिजाइन',
                description: 'Creative nail designs and treatments',
                icon: 'nail-polish',
                isActive: true,
                displayOrder: 3
            }
        ]
    });
    console.log(`📚 Created ${categories.count} categories`);
    // ======================
    // 3. Create Service Providers
    // ======================
    const providers = [];
    const providerData = [
        {
            firstName: 'Anjali',
            lastName: 'Shrestha',
            email: 'anjali@beauty.com',
            phone: '+9779841234567',
            businessName: 'Anjali Beauty Studio',
            bio: 'Certified makeup artist with 5 years experience',
            experience: 5,
            category: 'Hair Care'
        },
        {
            firstName: 'Rina',
            lastName: 'Gurung',
            email: 'rina@nails.com',
            phone: '+9779856789012',
            businessName: 'Rina Nail Studio',
            bio: 'Nail art specialist with 3 years experience',
            experience: 3,
            category: 'Nail Art'
        }
    ];
    for (const provider of providerData) {
        const category = await prisma.category.findFirstOrThrow({
            where: { name: provider.category }
        });
        const user = await prisma.user.create({
            data: {
                email: provider.email,
                phone: provider.phone,
                password: (0, bcryptjs_1.hashSync)('ProviderPass123!', SALT_ROUNDS),
                role: client_1.UserRole.SERVICE_PROVIDER,
                firstName: provider.firstName,
                lastName: provider.lastName,
                status: client_1.UserStatus.ACTIVE,
                emailVerified: true,
                providerProfile: {
                    create: {
                        bio: provider.bio,
                        experience: provider.experience,
                        businessName: provider.businessName,
                        categoryId: category.id,
                        kycStatus: client_1.VerificationStatus.APPROVED,
                        documents: {
                            create: {
                                type: client_1.DocumentType.ID_PROOF,
                                name: 'Citizenship Certificate',
                                url: 'https://yopreety.com/docs/citizenship.pdf',
                                verificationStatus: client_1.VerificationStatus.APPROVED
                            }
                        },
                        workingHours: {
                            create: [
                                { dayOfWeek: 1, startTime: '09:00', endTime: '18:00' }, // Monday
                                { dayOfWeek: 2, startTime: '09:00', endTime: '18:00' }, // Tuesday
                                { dayOfWeek: 4, startTime: '10:00', endTime: '20:00' }, // Thursday
                            ]
                        }
                    }
                }
            }
        });
        providers.push(user);
        console.log(`💇♀️ Provider created: ${user.email}`);
    }
    // ======================
    // 4. Create Customers
    // ======================
    const customers = [];
    const customerData = [
        {
            firstName: 'Sarita',
            lastName: 'Gurung',
            email: 'sarita@customer.com',
            phone: '+9779865432109'
        },
        {
            firstName: 'Priya',
            lastName: 'Shakya',
            email: 'priya@customer.com',
            phone: '+9779876543210'
        }
    ];
    for (const customer of customerData) {
        const user = await prisma.user.create({
            data: {
                email: customer.email,
                phone: customer.phone,
                password: (0, bcryptjs_1.hashSync)('CustomerPass123!', SALT_ROUNDS),
                role: client_1.UserRole.CUSTOMER,
                firstName: customer.firstName,
                lastName: customer.lastName,
                status: client_1.UserStatus.ACTIVE,
                emailVerified: true,
                customerProfile: {
                    create: {
                        emergencyContact: '+9779800000001'
                    }
                },
                address: {
                    create: {
                        type: 'HOME',
                        name: 'Primary Address',
                        street: 'New Baneshwor',
                        phone: '9876543210',
                        city: 'Kathmandu',
                        state: 'Bagmati',
                        location: {
                            type: 'Point',
                            coordinates: [85.3320, 27.6932]
                        },
                        isDefault: true,
                        isVerified: true
                    }
                }
            }
        });
        customers.push(user);
        console.log(`👩 Customer created: ${user.email}`);
    }
    // // ======================
    // // 5. Create Services
    // // ======================
    // const services = [];
    // const serviceData = [
    //   {
    //     name: 'Bridal Makeup Package',
    //     price: 15000,
    //     duration: 120,
    //     category: 'Hair Care',
    //     providerEmail: 'anjali@beauty.com'
    //   },
    //   {
    //     name: 'Gel Manicure',
    //     price: 1500,
    //     duration: 60,
    //     category: 'Nail Art',
    //     providerEmail: 'rina@nails.com'
    //   }
    // ];
    // for (const service of serviceData) {
    //   const provider = await prisma.user.findFirstOrThrow({
    //     where: { email: service.providerEmail },
    //     include: { providerProfile: true }
    //   });
    //   const category = await prisma.category.findFirstOrThrow({
    //     where: { name: service.category }
    //   });
    //   const newService = await prisma.service.create({
    //     data: {
    //       name: service.name,
    //       description: `${service.name} service description`,
    //       price: service.price,
    //       duration: service.duration,
    //       providerId: providerUser.providerProfile.id,
    //       categoryId: category.id,
    //       isActive: true
    //     }
    //   });
    //   services.push(newService);
    //   console.log(`💅 Service created: ${newService.name}`);
    // }
    // ======================
    // 5. Create Services
    // ======================
    const services = [];
    const serviceData = [
        {
            name: 'Bridal Makeup Package',
            price: 15000,
            duration: 120,
            category: 'Hair Care',
            providerEmail: 'anjali@beauty.com'
        },
        {
            name: 'Gel Manicure',
            price: 1500,
            duration: 60,
            category: 'Nail Art',
            providerEmail: 'rina@nails.com'
        }
    ];
    for (const service of serviceData) {
        const providerUser = await prisma.user.findFirstOrThrow({
            where: { email: service.providerEmail },
            include: { providerProfile: true }
        });
        if (!providerUser.providerProfile) {
            throw new Error(`Provider profile not found for ${service.providerEmail}`);
        }
        const category = await prisma.category.findFirstOrThrow({
            where: { name: service.category }
        });
        const newService = await prisma.service.create({
            data: {
                name: service.name,
                description: `${service.name} service description`,
                price: service.price,
                duration: service.duration,
                providerId: providerUser.providerProfile.id, // Use ServiceProvider ID
                categoryId: category.id,
                isActive: true
            }
        });
        services.push(newService);
        console.log(`💅 Service created: ${newService.name}`);
    }
    // ======================
    // 6. Create Bookings
    // ======================
    const bookings = [];
    const bookingData = [
        {
            customerEmail: 'sarita@customer.com',
            providerEmail: 'anjali@beauty.com',
            serviceName: 'Bridal Makeup Package',
            date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
            startTime: '10:00',
            endTime: '12:00'
        },
        {
            customerEmail: 'priya@customer.com',
            providerEmail: 'rina@nails.com',
            serviceName: 'Gel Manicure',
            date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
            startTime: '14:00',
            endTime: '15:00'
        }
    ];
    for (const booking of bookingData) {
        const customer = await prisma.user.findFirstOrThrow({
            where: { email: booking.customerEmail },
            include: { customerProfile: true }
        });
        const provider = await prisma.user.findFirstOrThrow({
            where: { email: booking.providerEmail },
            include: { providerProfile: true }
        });
        const service = await prisma.service.findFirstOrThrow({
            where: { name: booking.serviceName }
        });
        const newBooking = await prisma.booking.create({
            data: {
                customerId: customer.id,
                providerId: provider.id,
                status: client_1.BookingStatus.CONFIRMED,
                type: 'ONSITE',
                scheduledDate: booking.date,
                scheduleStartTime: booking.startTime,
                scheduleEndTime: booking.endTime,
                totalAmount: service.price,
                paymentMethod: client_1.PaymentMethod.KHALTI,
                bookedItems: {
                    create: {
                        serviceId: service.id
                    }
                },
                payment: {
                    create: {
                        amount: service.price,
                        method: client_1.PaymentMethod.KHALTI,
                        status: client_1.PaymentStatus.COMPLETED
                    }
                }
            }
        });
        bookings.push(newBooking);
        console.log(`📅 Booking created: #${newBooking.id}`);
    }
    // ======================
    // 7. Create Reviews
    // ======================
    await prisma.review.create({
        data: {
            serviceId: services[0].id,
            authorId: customers[0].id,
            rating: 5,
            comment: 'Excellent bridal makeup service! Highly recommended!',
            isVerified: true
        }
    });
    console.log(`⭐ Review created for ${services[0].name}`);
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
