import express from "express";
import { authorizeUser } from "../auth";
import {
  getOrganizationById,
  getOrgProfile,
} from "./organizations.controllers";
import { router as eventsRouter } from "../../components/events";
import { router as applicationRouter } from "../../components/applications";

const router = express.Router();

router.use("/:organizationId/events", eventsRouter);
router.use("/:organizationId/applications", applicationRouter);

router.route("/me").get(authorizeUser, getOrgProfile);
router.route("/:id").get(getOrganizationById);

export { router };
