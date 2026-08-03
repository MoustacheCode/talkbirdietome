// Imports Hapi and dotenv modules
import Hapi from "@hapi/hapi";
import dotenv from "dotenv";
// Imports the round routes
import roundRoutes from "./routes/roundRoutes.js";

// Loads variables from .env
dotenv.config();

// Starts server and sets health route
const init = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 8080,
        host: "0.0.0.0",
        routes: {
            payload: {
                parse: true,
                allow: "application/json",
            },
        },
    });

    // Health check endpoint to see if server is running
    server.route({
        method: "GET",
        path: "/health",
        handler: () => {
            return { status: "ok" };
        },
    });

    // Adds the round routes to the server
    server.route(roundRoutes);

    // Starts server and console log to show server is running
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};
// Calls init function to start the server
init();
