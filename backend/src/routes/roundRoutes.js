import { roundController } from "../controllers/roundController.js"; // Imports controller so it can be called in the routes
import { verifySupabaseToken } from "../middleware/verifySupabaseToken.js"; // Imports the verifySupabaseToken middleware to protect routes
import { loadRound } from "../middleware/loadRound.js"; // Imports the loadRound middleware to load a round by ID
import { checkOwnership } from "../middleware/checkOwnership.js"; // Imports the checkOwnership middleware to verify user ownership of a round

const roundRoutes = [
    {
        method: "GET",
        path: "/rounds",
        options: {
            pre: [{ method: verifySupabaseToken }],
        },
        handler: roundController.getRounds, // Calls the getRounds function from the controller
    },
    {
        method: "POST",
        path: "/rounds",
        handler: roundController.createRound, // Calls the createRound function from the controller
        options: {
            pre: [{ method: verifySupabaseToken }],
            payload: {
                allow: "application/json",
                parse: true,
            },
        },
    },

    {
        method: "PUT",
        path: "/rounds/{id}",
        handler: roundController.updateRound, // Calls the updateRound function from the controller
        options: {
            pre: [
                { method: verifySupabaseToken },
                { method: loadRound },
                { method: checkOwnership() },
            ],
            payload: {
                allow: "application/json", // Specifies that the payload should be in JSON format
                parse: true,
            },
        },
    },

    {
        method: "DELETE",
        path: "/rounds/{id}",
        options: {
            pre: [
                { method: verifySupabaseToken },
                { method: loadRound },
                { method: checkOwnership() },
            ],
        },
        handler: roundController.deleteRound, // Calls the deleteRound function from the controller
    },
];

export default roundRoutes; // Exports the routes so they can be used in the server.js file
