import { roundService } from "../services/roundService.js";

export const roundController = {
    getRounds: async (request, h) => {
        try {
            const rounds = await roundService.getAllRounds(); // Calls the getAllRounds function from the service
            return h.response(rounds).code(200); // Returns the rounds with a 200 status code
        } catch (error) {
            console.error(error);
            return h.response({ error: "Failed to fetch rounds" }).code(500); // Retuns an error response with a 500 status code
        }
    },

    createRound: async (request, h) => {
        try {
            const newRound = await roundService.createRound(request.payload); // Calls the createRound function from the service with the request payload
            return h.response(newRound).code(201); // Returns the newly created round with a 201 status code
        } catch (error) {
            console.error(error);
            return h.response({ error: "Failed to create round" }).code(500); // Returns an error response with a 500 status code
        }
    },
};
