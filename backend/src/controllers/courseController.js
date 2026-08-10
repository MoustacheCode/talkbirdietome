import prisma from "../prisma/client.js"; // Imports the prisma client to interact with the database

export const courseController = {
    searchCourses: async (request, h) => {
        // Extract the query search string from the active URL parameter strings
        const { q } = request.query;

        // Force a brief check to make sure the user isn't executing empty lookups
        if (!q || q.trim().length < 2) {
            return h.response([]).code(200); // Returns an empty array cleanly with a 200 status code
        }

        try {
            // Find matches using text filtering constraints with database optimization boundaries
            const matches = await prisma.club.findMany({
                where: {
                    OR: [
                        { name: { contains: q, mode: "insensitive" } }, // Partial match on the club name
                        { region: { contains: q, mode: "insensitive" } }, // Partial match on the state or city location
                    ],
                },
                include: {
                    courses: {
                        include: {
                            tees: true, // Pre-loads available tee box color configurations for selection steps
                        },
                    },
                },
                take: 10, // Limit the return load to 10 entries to maximize frontend loading performance
            });

            return h.response(matches).code(200); // Returns the filtered array with a 200 status code
        } catch (error) {
            console.error(error);
            return h
                .response({
                    error: "Search failed - the ball got buried deep in the bunker",
                })
                .code(500); // Returns an error response with a 500 status code
        }
    },
};
