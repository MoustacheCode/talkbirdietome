import prisma from "../prisma/client.js"; // Imports the prisma client to interact with the database

export const courseController = {
    searchCourses: async (request, h) => {
        const { q } = request.query;

        if (!q || q.trim().length < 2) {
            return h.response([]).code(200);
        }

        try {
            const matches = await prisma.club.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } },
                        { region: { contains: q, mode: "insensitive" } },
                    ],
                },
                include: {
                    courses: {
                        include: {
                            tees: {
                                include: {
                                    holes: {
                                        orderBy: { holeNumber: "asc" }, // Exposes hidden Hole ID for Postman testing
                                    },
                                },
                            },
                        },
                    },
                },
                take: 10,
            });

            return h.response(matches).code(200);
        } catch (error) {
            console.error(error);
            return h
                .response({
                    error: "Search failed - the ball got buried deep in the bunker",
                })
                .code(500);
        }
    },
};
