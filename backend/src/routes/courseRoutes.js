import { courseController } from "../controllers/courseController.js";

export const courseRoutes = [
    {
        method: "GET",
        path: "/api/courses/search",
        handler: courseController.searchCourses, // Binds the course search function controller directly
        options: {
            auth: false, // Set to false initially so users can explore layouts before logging in
        },
    },
    {
        method: "GET",
        path: "/courses",
        handler: courseController.getCourses,
        options: {
            auth: false, // Set to false initially so users can explore layouts before logging in
        },
    },
    {
        method: "GET",
        path: "/courses/{id}",
        handler: courseController.getCourseById,
        options: { auth: false },
    },
    {
        method: "GET",
        path: "/courses/{id}/tees",
        handler: courseController.getCourseTees,
        options: { auth: false },
    },
];
