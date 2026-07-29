import { roundService } from "../services/roundService.js";

export const roundController = {
    getRounds: async (req, res) => {
        const rounds = await roundService.getAllRounds();
        res.json(rounds); // Send the rounds as a JSON repsonse
    },

    createRound: async (req, res) => {
        const newRound = await roundService.createRound(req.body);
        res.json(newRound); // Send new round as JSON response
    },
};
