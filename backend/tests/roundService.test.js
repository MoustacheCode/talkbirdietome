import { roundService } from "../services/roundService.js";
import prisma from "../prisma/client.js"; // Import the prisma client to interact with the database

jest.mock("../prisma/client.js", () => ({
    // Mock Prisma client to avoid actual database calls during testing
    round: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));

// Tests for the roundService functions using AAA pattern (Arrange, Act, Assert)

describe("roundService", () => {
    test("getAllRounds to return list of rounds", async () => {
        // Arrange: fake the return value of prisma.round.findMany to simulate database response
        prisma.round.findMany.mockResolvedValue([{ id: 1, name: "Round 1" }]);

        // Act: call the function being tested
        const result = await roundService.getAllRounds();

        // Assert: confirm the expected outcome
        expect(result).toEqual([{ id: 1, name: "Round 1" }]);
    });
});
