import { roundService } from "../services/roundService.js";
import prisma from "../prisma/client.js"; // Import the prisma client to interact with the database

jest.mock("../prisma/client.js", () => ({
    round: {
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
}));
