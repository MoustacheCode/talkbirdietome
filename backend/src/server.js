// Imports Hapi and dotenv modules
import Hapi from "@hapi/hapi";
import dotenv from "dotenv";

// Loads variables from .env
dotenv.config();

// Starts server and sets health route
const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: "localhost",
    });

    // Health check endpoint to see if server is running
    server.route({
        method: "GET",
        path: "/health",
        handler: () => {
            return { status: "ok" };
        },
    });
    // Starts server and console log to show server is running
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};
// Calls init function to start the server
init();
