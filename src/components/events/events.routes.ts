import express from "express";
import { getEventById } from "./events.controllers";

const router = express.Router();

router.route("/:id").get(getEventById);

export { router };
