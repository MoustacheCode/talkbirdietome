import { roundService } from "../services/roundService.js";

export const roundController = {
    getRounds: async (request, h) => {
        try {
            const rounds = await roundService.getAllRounds(); // Calls the getAllRounds function from the service
            return h.response(rounds).code(200); // Returns the rounds with a 200 status code
        } catch (error) {
            console.error(error);
            return h
                .response({ error: "This round was lost in the trees" })
                .code(500); // Retuns an error response with a 500 status code
        }
    },

    createRound: async (request, h) => {
        try {
            const newRound = await roundService.createRound(request.payload); // Calls the createRound function from the service with the request payload
            return h.response(newRound).code(201); // Returns the newly created round with a 201 status code
        } catch (error) {
            console.error(error);
            return h
                .response({
                    error: "Couldn't create the round - it sliced way off into the rough",
                })
                .code(500); // Returns an error response with a 500 status code
        }
    },

    updateRound: async (request, h) => {
        const id = Number(request.params.id); // Converts the id parameter from the request to a number
        const data = request.payload; // Gets the payload from the request

        try {
            const updatedRound = await roundService.updateRound(id, data); // Calls the updateRound function from the service with the id and data
            return h.response(updatedRound).code(200); // Returns the updated round
        } catch (error) {
            console.error(error);
            return h
                .response({ error: "Oops! Failed to update this round" })
                .code(400); // Returns an error response with a 400 status code
        }
    },

    deleteRound: async (request, h) => {
        const id = Number(request.params.id); // Converts the id parameter from the request to a number

        try {
            await roundService.deleteRound(id); // Calls the deleteRound function from the service with the id
            return h
                .response({ message: "FORE! Round deleted successfully" })
                .code(200); // Returns a success message with a 200 status code
        } catch (error) {
            console.error(error);
            return h.response({ error: "Round deletion failed" }).code(400); // Returns an error response with a 400 status code
        }
    },
};
