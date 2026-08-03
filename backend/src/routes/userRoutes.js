import { userController } from '../controllers/userController.js'; // Imports controller so it can be called in the routes

const userRoutes = [
    {
        method: "GET",
        path: "/register",
        handler: userController.register // Calls the register function from the controller
        options: {
            payload: {
                allow: "application/json",
                parse: true,
            },
        },
    },
];

export default userRoutes; // Exports the routes so they can be used in the server.js file