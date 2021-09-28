import express from "express";
import { getOrganizationById } from "./organizations.controllers";
import { router as eventsRouter } from "../../components/events";

const router = express.Router();

router.use("/:organizationId/events", eventsRouter);

router.route("/:id").get(getOrganizationById);

export { router };
