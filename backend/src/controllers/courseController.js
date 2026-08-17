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
    // List all courses
    getCourses: async (request, h) => {
        try {
            const courses = await prisma.course.findMany({
                include: { club: true },
            });
            return h.response(courses).code(200);
        } catch (error) {
            console.error(error);
            return h.response({ error: "Failed to fetch courses" }).code(500);
        }
    },
    // Get course by ID
    getCourseById: async (request, h) => {
        const { id } = request.params;

        try {
            const course = await prisma.course.findUnique({
                where: { id: Number(id) },
                include: { club: true },
            });

            if (!course) {
                return h.response({ message: "Course not found" }).code(404);
            }

            return h.response(course).code(200);
        } catch (error) {
            console.error(error);
            return h.response({ error: "Failed to fetch course" }).code(500);
        }
    },
    // Get tees for a course
    getCourseTees: async (request, h) => {
        const { id } = request.params;

        try {
            const tees = await prisma.tee.findMany({
                where: { courseId: Number(id) },
            });

            return h.response(tees).code(200);
        } catch (error) {
            console.error(error);
            return h.response({ error: "Failed to fetch tees" }).code(500);
        }
    },
};
