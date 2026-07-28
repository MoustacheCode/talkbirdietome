import Hapi from "@hapi/hapi";
import dotenv from "dotenv";

dotenv.config();

const init = async () => {
    const server = Hapi.server({
        port: 3000,
        host: "localhost",
    });

    server.route({
        method: "GET",
        path: "/health",
        handler: () => {
            return { status: "ok" };
        },
    });

    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

init();
