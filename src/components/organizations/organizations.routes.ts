import express from "express";
import { getOrganizationById } from "./organizations.controllers";
import { router as eventsRouter } from "../../components/events";
import { router as applicationRouter } from "../../components/applications";

const router = express.Router();

router.use("/:organizationId/events", eventsRouter);
router.use("/:organizationId/applications", applicationRouter);

router.route("/:id").get(getOrganizationById);

export { router };
