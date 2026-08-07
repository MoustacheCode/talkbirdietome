import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
    await prisma.$transaction([
        prisma.round.deleteMany(),
        prisma.user.deleteMany(),
    ]);

    // Seed users
    const user = await prisma.user.create({
        data: {
            id: 1,
            email: "user@example.com",
            role: "user",
            passwordHash: "test-hash",
        },
    });

    const admin = await prisma.user.create({
        data: {
            id: 2,
            email: "admin@example.com",
            role: "admin",
            passwordHash: "test-hash",
        },
    });

    // Seed rounds
    await prisma.round.create({
        data: {
            id: 1,
            totalScore: 70,
            scoreRelativeToPar: -2,
            userId: user.id,
            courseName: "Test Course",
            datePlayed: new Date(),
        },
    });

    await prisma.round.create({
        data: {
            id: 999,
            totalScore: 80,
            scoreRelativeToPar: 8,
            userId: admin.id,
            courseName: "Other Course",
            datePlayed: new Date(),
        },
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
