import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// 💡 Fixed: Increased timeout to 15000ms so your Postgres DB has time to wipe and reset tables
beforeAll(async () => {
    // Execute independent purges sequentially instead of wrapping them in a heavy transaction block
    await prisma.holeScore.deleteMany();
    await prisma.round.deleteMany();
    await prisma.hole.deleteMany();
    await prisma.tee.deleteMany();
    await prisma.course.deleteMany();
    await prisma.club.deleteMany();
    await prisma.user.deleteMany();

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

    // Provision a basic mock club structure required by the updated relational constraint layer
    const mockClub = await prisma.club.create({
        data: {
            id: 1,
            name: "Test Country Club",
            region: "IL",
            country: "United States",
        },
    });

    // Provision an explicit course entry mapped to the parent testing club
    const mockCourse = await prisma.course.create({
        data: {
            id: 1,
            name: "Championship Layout",
            clubId: mockClub.id,
        },
    });

    // Provision a default white tee configuration block to link test scorecards cleanly
    const mockTee = await prisma.tee.create({
        data: {
            id: 1,
            color: "White",
            totalPar: 72,
            courseId: mockCourse.id,
        },
    });

    // Seed rounds
    await prisma.round.create({
        data: {
            id: 1,
            totalScore: 70,
            scoreRelativeToPar: -2,
            userId: user.id,
            courseId: mockCourse.id, // Explicit reference link matching the updated model structure
            teeId: mockTee.id, // Explicit reference link matching the updated model structure
            datePlayed: new Date(),
        },
    });

    await prisma.round.create({
        data: {
            id: 999,
            totalScore: 80,
            scoreRelativeToPar: 8,
            userId: admin.id,
            courseId: mockCourse.id, // Explicit reference link matching the updated model structure
            teeId: mockTee.id, // Explicit reference link matching the updated model structure
            datePlayed: new Date(),
        },
    });
}, 15000); // 💡 Fixed: Added explicit 15-second execution limit for the DB hook setup

afterAll(async () => {
    await prisma.$disconnect();
});
