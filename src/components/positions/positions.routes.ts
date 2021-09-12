import express from "express";
import { getPositions, getPositionById } from "./positions.controllers";

const router = express.Router();

router.route("/").get(getPositions);
router.route("/:id").get(getPositionById);

export { router };
