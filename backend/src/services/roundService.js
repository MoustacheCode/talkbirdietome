import { prisma } from "../prismaClient.js";

export const roundService = {
    getAllRounds: async () => {
        // Get all rounds from the database
        return prisma.round.findMany();
    },

    createRound: async (data) => {
        return prisma.round.create({ data }); // Create a new round in the database
    },
};
