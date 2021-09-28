import express from "express";
import { getEvents, getEventById } from "./events.controllers";

const router = express.Router({ mergeParams: true });

router.route("/").get(getEvents);
router.route("/:id").get(getEventById);

export { router };
