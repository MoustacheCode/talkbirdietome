import express from "express";
import { roundController } from "../controllers/roundController.js";

const router = express.Router();

router.get("/", roundController.getRounds); // Route to get all rounds
router.post("/", roundController.createRound); // Route to create a new round

export default router;
