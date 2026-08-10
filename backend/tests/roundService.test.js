import { jest } from "@jest/globals";

// Mock Prisma client
jest.unstable_mockModule("../src/prisma/client.js", () => {
    const mockTx = {
        round: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
        },
        holeScore: {
            createMany: jest.fn(),
            upsert: jest.fn(),
        },
    };

    return {
        default: {
            round: {
                findMany: jest.fn(),
                delete: jest.fn(),
            },
            // Mock transaction to immediately execute the callback with our mock transaction client
            $transaction: jest.fn((callback) => callback(mockTx)),
            _mockTx: mockTx, // Expose mock internal client references for isolated assertions
        },
    };
});

const prisma = (await import("../src/prisma/client.js")).default;
const { roundService } = await import("../src/services/roundService.js");

// Tests for roundService

// Test for getAllRounds - Returns all the rounds from the database
describe("roundService", () => {
    test("getAllRounds to return all rounds", async () => {
        const expectedRounds = [
            { id: 1, totalScore: 72, userId: 1, courseId: 1, teeId: 1 },
        ];
        prisma.round.findMany.mockResolvedValue(expectedRounds);

        const result = await roundService.getAllRounds();

        expect(result).toEqual(expectedRounds);
        expect(prisma.round.findMany).toHaveBeenCalledWith({
            include: {
                course: true,
                tee: true,
                holeScores: {
                    include: {
                        hole: true,
                    },
                },
            },
        });
    });
});

// Test for createRound - Creates a new round in the database
describe("roundService", () => {
    test("createRound to create new round", async () => {
        const newRoundData = {
            userId: 1,
            courseId: 5,
            teeId: 2,
            datePlayed: "2026-04-15T00:00:00.000Z",
            totalScore: 72,
            scoreRelativeToPar: 0,
            holeScores: [
                { holeId: 10, strokes: 4 },
                { holeId: 11, strokes: 3 },
            ],
        };

        const createdBaseRound = { id: 2, userId: 1, courseId: 5, teeId: 2 };
        const fullyPopulatedRound = { ...createdBaseRound, holeScores: [] };

        prisma._mockTx.round.create.mockResolvedValue(createdBaseRound);
        prisma._mockTx.holeScore.createMany.mockResolvedValue({ count: 2 });
        prisma._mockTx.round.findUnique.mockResolvedValue(fullyPopulatedRound);

        const result = await roundService.createRound(newRoundData);

        expect(result).toEqual(fullyPopulatedRound);
        expect(prisma._mockTx.round.create).toHaveBeenCalled();
        expect(prisma._mockTx.holeScore.createMany).toHaveBeenCalledWith({
            data: [
                { roundId: 2, holeId: 10, strokes: 4, putts: null },
                { roundId: 2, holeId: 11, strokes: 3, putts: null },
            ],
        });
    });
});

// Test for updateRound - Updates an existing round in the database
describe("roundService", () => {
    test("updateRound to update current round", async () => {
        const roundId = 1;
        const updateData = {
            totalScore: 75,
            holeScores: [{ holeId: 10, strokes: 5 }],
        };

        const updatedFullRound = { id: 1, totalScore: 75, holeScores: [] };

        prisma._mockTx.holeScore.upsert.mockResolvedValue({});
        prisma._mockTx.round.update.mockResolvedValue(updatedFullRound);

        const result = await roundService.updateRound(roundId, updateData);

        expect(result).toEqual(updatedFullRound);
        expect(prisma._mockTx.holeScore.upsert).toHaveBeenCalledWith({
            where: {
                roundId_holeId: { roundId, holeId: 10 },
            },
            update: { strokes: 5, putts: null },
            create: { roundId, holeId: 10, strokes: 5, putts: null },
        });
    });
});

// Test for deleteRound - Deletes an existing round from the database
describe("roundService", () => {
    test("deleteRound to delete this round", async () => {
        const roundId = 1;
        const deletedRound = { id: 1, userId: 1 };

        prisma.round.delete.mockResolvedValue(deletedRound);

        const result = await roundService.deleteRound(roundId);

        expect(result).toEqual(deletedRound);
        expect(prisma.round.delete).toHaveBeenCalledWith({
            where: { id: roundId },
        });
    });
});
