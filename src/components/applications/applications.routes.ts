import express from "express";
import { getApplicationCountOfMe } from ".";
import { authorizeUser } from "../auth";
import {
  addApplication,
  getApplicationById,
  getApplicationsOfMe,
} from "./applications.controllers";

const router = express.Router();

router.route("/").post(addApplication);
router.route("/me").get(authorizeUser, getApplicationsOfMe);
router.route("/me/count").get(authorizeUser, getApplicationCountOfMe);
router.route("/:id").get(getApplicationById);

export { router };
