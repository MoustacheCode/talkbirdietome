import prisma from "../prisma/client.js"; // Imports the prisma client to interact with the database

export const roundService = {
    getAllRounds: async () => {
        // Get all rounds from the database
        return prisma.round.findMany();
    },

    createRound: async (data) => {
        return prisma.round.create({ data }); // Create a new round in the database
    },

    updateRound: async (id, data) => {
        return prisma.round.update({
            where: { id }, // Update the round with the specified id
            data,
        });
    },

    deleteRound: async (id) => {
        return prisma.round.delete({
            where: { id }, // Delete the round with the specified id
        });
    },
};
