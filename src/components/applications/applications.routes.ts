import express from "express";
import { getApplicationCountOfMe } from ".";
import { authorizeUser } from "../auth";
import {
  getApplications,
  addApplication,
  getApplicationById,
  getApplicationsOfMe,
} from "./applications.controllers";

const router = express.Router({ mergeParams: true });

router.route("/").get(getApplications).post(addApplication);
router.route("/me").get(authorizeUser, getApplicationsOfMe);
router.route("/me/count").get(authorizeUser, getApplicationCountOfMe);
router.route("/:id").get(getApplicationById);

export { router };
