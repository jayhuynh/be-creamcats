import express from "express";
import { auth } from "../auth";
import {
  addApplication,
  getApplicationById,
  getApplicationsOfMe,
} from "./applications.controllers";

const router = express.Router();

router.route("/").post(addApplication);
router.route("/me").get(auth, getApplicationsOfMe);
router.route("/:id").get(getApplicationById);

export { router };
