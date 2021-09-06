import express from "express";
import { getPositions } from "./positions.controllers";

const router = express.Router();

router.route("/").get(getPositions);

export { router };
