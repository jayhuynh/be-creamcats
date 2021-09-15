import express from "express";
import { getApplicationCountOfMe } from ".";
import { auth } from "../auth";
import {
  addApplication,
  getApplicationById,
  getApplicationsOfMe,
} from "./applications.controllers";

const router = express.Router();

router.route("/").post(addApplication);
router.route("/me").get(auth, getApplicationsOfMe);
router.route("/me/count").get(auth, getApplicationCountOfMe);
router.route("/:id").get(getApplicationById);

export { router };
