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
            console.log("PAYLOAD RECEIVED:", request.payload);
            const data = { ...request.payload }; // Make a shallow copy of the payload to modify attributes safely

            // Enforce explicit structural requirements for relational data operations
            if (!data.courseId || !data.teeId) {
                return h
                    .response({
                        error: "Missing links! Every round requires a selected course and tee box",
                    })
                    .code(400); // Returns a validation error response with a 400 status code
            }

            // Automatically compute total scorecard aggregates if an active hole scores array exists
            if (Array.isArray(data.holeScores) && data.holeScores.length > 0) {
                data.totalScore = data.holeScores.reduce(
                    (sum, item) => sum + (Number(item.strokes) || 0),
                    0,
                );

                // Track relative metric tracking fields if an administrative total par parameter is sent by the client
                if (data.totalPar) {
                    data.scoreRelativeToPar =
                        data.totalScore - Number(data.totalPar);
                }
            }

            const newRound = await roundService.createRound(data); // Calls the createRound function from the service with the request payload
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
        const data = { ...request.payload }; // Gets the payload from the request

        try {
            // Recompute dynamic aggregates during active scorecard updates if adjustments are detected
            if (Array.isArray(data.holeScores) && data.holeScores.length > 0) {
                data.totalScore = data.holeScores.reduce(
                    (sum, item) => sum + (Number(item.strokes) || 0),
                    0,
                );

                if (data.totalPar) {
                    data.scoreRelativeToPar =
                        data.totalScore - Number(data.totalPar);
                }
            }

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
