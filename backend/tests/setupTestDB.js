import { prisma } from "../src/db.js";

beforeAll(async () => {
    // Clean DB
    await prisma.round.deleteMany();

    // Seed rounds
    await prisma.round.create({
        id: 1,
        data: {
            totalScore: 70,
            userId: "user-123",
            courseName: "Test Course",
            datePlayed: new Date(),
        },
    });

    await prisma.round.create({
        id: 999,
        data: {
            totalScore: 80,
            userId: "other-user-999",
            courseName: "Other Course",
            datePlayed: new Date(),
        },
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});
