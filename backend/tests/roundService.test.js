import { jest } from "@jest/globals";

// Mock Prisma client
jest.unstable_mockModule("../src/prisma/client.js", () => ({
    default: {
        round: {
            findMany: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    },
}));

const prisma = (await import("../src/prisma/client.js")).default;
const { roundService } = await import("../src/services/roundService.js");

// Tests for roundService

// Test for getAllRounds - Returns all the rounds from the database
describe("roundService", () => {
    test("getAllRounds to return all rounds", async () => {
        prisma.round.findMany.mockResolvedValue([{ id: 1, name: "Round 1" }]);

        const result = await roundService.getAllRounds();

        expect(result).toEqual([{ id: 1, name: "Round 1" }]);
    });
});

// Test for createRound - Creates a new round in the database
describe("roundService", () => {
    test("createRound to create new round", async () => {
        const newRoundData = { name: "Round 2" };
        const createdRound = { id: 2, name: "Round 2" };

        prisma.round.create.mockResolvedValue(createdRound);

        const result = await roundService.createRound(newRoundData);

        expect(result).toEqual(createdRound);
        expect(prisma.round.create).toHaveBeenCalledWith({
            data: newRoundData,
        });
    });
});

// Test for updateRound - Updates an existing round in the database
describe("roundService", () => {
    test("updateRound to update current round", async () => {
        const roundId = 1;
        const updateData = { name: "Updated Round 1" };
        const updatedRound = { id: 1, name: "Updated Round 1" };

        prisma.round.update.mockResolvedValue(updatedRound);

        const result = await roundService.updateRound(roundId, updateData);

        expect(result).toEqual(updatedRound);
        expect(prisma.round.update).toHaveBeenCalledWith({
            where: { id: roundId },
            data: updateData,
        });
    });
});

// Test for deleteRound - Deletes an existing round from the database
describe("roundService", () => {
    test("deleteRound to delete this round", async () => {
        const roundId = 1;
        const deletedRound = { id: 1, name: "Round 1" };

        prisma.round.delete.mockResolvedValue(deletedRound);

        const result = await roundService.deleteRound(roundId);

        expect(result).toEqual(deletedRound);
        expect(prisma.round.delete).toHaveBeenCalledWith({
            where: { id: roundId },
        });
    });
});

// Test for getRoundById - Returns a round by its ID
describe("roundService", () => {
    test("getRoundById to return round by id", async () => {
        cost roundId = 1;
        const roundData = { id: 1, name: "Round 1" };

        prisma.round.findUnique.mockResolvedValue(roundData);

        const result = await roundService.getRoundById(1);

        expect(result).toEqual(roundData);
        expect(prisma.round.findUnique).toHaveBeenCalledWith({
            where: { id: roundId },
        });
    });
});
