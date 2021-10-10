import express from "express";
import { router as positionsRouter } from "../../components/positions";
import { getEvents, getEventById, createEvent } from "./events.controllers";

const router = express.Router({ mergeParams: true });

router.route("/").post(createEvent);
router.use("/:eventId/positions", positionsRouter);

router.route("/").get(getEvents);
router.route("/:id").get(getEventById);

export { router };
