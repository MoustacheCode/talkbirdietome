import prisma from "../prisma/client.js";

export const teeController = {
    getTeeHoles: async (request, h) => {
        const { id } = request.params;

        try {
            const holes = await prisma.hole.findMany({
                where: { teeId: Number(id) },
                orderBy: { holeNumber: "asc" },
            });

            return h.response(holes).code(200);
        } catch (error) {
            console.error(error);
            return h.response({ error: "Failed to fetch holes" }).code(500);
        }
    },
};
