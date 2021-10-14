import express from "express";
import { authorizeOrganization } from "../auth";
import {
  getOrganizationById,
  getOrgProfile,
  updateOrganization,
} from "./organizations.controllers";
import { router as eventsRouter } from "../../components/events";
import { router as applicationRouter } from "../../components/applications";

const router = express.Router();

router.use("/:organizationId/events", eventsRouter);
router.use("/:organizationId/applications", applicationRouter);

router.route("/me").get(authorizeOrganization, getOrgProfile);
router.route("/:id").get(getOrganizationById);
router.route("/:id").get(getOrganizationById).patch(updateOrganization);

export { router };
