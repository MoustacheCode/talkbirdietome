import { teeController } from "../controllers/teeController.js";

export const teeRoutes = [
    {
        method: "GET",
        path: "/tees/{id}/holes",
        handler: teeController.getTeeHoles,
        options: { auth: false },
    },
];
