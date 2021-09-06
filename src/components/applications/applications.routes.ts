import express from "express";
import { addApplication, getApplicationById } from "./applications.controllers";

const router = express.Router();

router.route("/").post(addApplication);

router.route("/:id").get(getApplicationById);

export { router };
