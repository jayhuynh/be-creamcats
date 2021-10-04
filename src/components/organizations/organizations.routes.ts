import express from "express";
import {
  getOrganizationById,
  createOrganization,
} from "./organizations.controllers";
import { router as eventsRouter } from "../../components/events";
import { router as applicationRouter } from "../../components/applications";

const router = express.Router();

router.route("/").post(createOrganization);
router.use("/:organizationId/events", eventsRouter);
router.use("/:organizationId/applications", applicationRouter);

router.route("/:id").get(getOrganizationById);

export { router };
