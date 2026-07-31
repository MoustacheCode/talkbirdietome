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
describe("roundService", () => {
    test("getAllRounds to return all rounds", async () => {
        prisma.round.findMany.mockResolvedValue([{ id: 1, name: "Round 1" }]);

        const result = await roundService.getAllRounds();

        expect(result).toEqual([{ id: 1, name: "Round 1" }]);
    });
});

describe("roundService", () => {
    test("createRound to create new round", async () => {
        const newRoundData = { name: "Round 2" };
        const createdRound = { id: 2, name: "Round 2" };

        prisma.round.create.mockResolvedValue(createdRount);

        const result = await roundService.createRound(newRoundData);

        expect(result).toEqual(createdRound);
        expect(prisma.round.create).toHaveBeenCalledWith({
            data: newRoundData,
        });
    });
});
