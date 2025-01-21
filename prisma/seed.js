// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

async function main() {
    console.log('Seeding database...');
  const hashedPassword = await bcrypt.hash('hary123', 10);


    // Seed Users
    const users = [
        {
            email: 'customer1@example.com',
            phone: '1234567890',
            password: hashedPassword, // Replace with an actual hash
            role: 'CUSTOMER',
            firstName: 'John',
            lastName: 'Doe',
            status: 'ACTIVE'
        },
        {
            email: 'provider1@example.com',
            phone: '0987654321',
            password: hashedPassword, // Replace with an actual hash
            role: 'SERVICE_PROVIDER',
            firstName: 'Jane',
            lastName: 'Smith',
            status: 'ACTIVE'
        },
        {
            email: 'admin@example.com',
            phone: '1122334455',
            password: hashedPassword, // Replace with an actual hash
            role: 'ADMIN',
            firstName: 'Alice',
            lastName: 'Johnson',
            status: 'ACTIVE'
        }
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user
        });
    }

    // Seed Categories
    const categories = [
        {
            name: 'Plumbing',
            description: 'Services related to plumbing and water systems.'
        },
        {
            name: 'Electrical',
            description: 'Services related to electrical repairs and installations.'
        },
        {
            name: 'Cleaning',
            description: 'Home and office cleaning services.'
        }
    ];

    for (const category of categories) {
        await prisma.category.upsert({
            where: { name: category.name },
            update: {},
            create: category
        });
    }

    // Seed Services
    const services = [
        {
            name: 'Leaky Faucet Repair',
            description: 'Fixing leaky faucets quickly and efficiently.',
            price: 50,
            duration: 30,
            provider: { connect: { userId: (await prisma.user.findFirst({ where: { email: 'provider1@example.com' } })).id } },
            category: { connect: { name: 'Plumbing' } }
        },
        {
            name: 'Wiring Installation',
            description: 'Expert wiring installation for homes and offices.',
            price: 150,
            duration: 120,
            provider: { connect: { userId: (await prisma.user.findFirst({ where: { email: 'provider1@example.com' } })).id } },
            category: { connect: { name: 'Electrical' } }
        },
        {
            name: 'Deep Cleaning',
            description: 'Comprehensive cleaning for residential spaces.',
            price: 200,
            duration: 240,
            provider: { connect: { userId: (await prisma.user.findFirst({ where: { email: 'provider1@example.com' } })).id } },
            category: { connect: { name: 'Cleaning' } }
        }
    ];

    for (const service of services) {
        await prisma.service.create({ data: service });
    }

    console.log('Seeding completed!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
