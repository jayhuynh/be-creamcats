import express from "express";
import { getOrganizationById } from "./organizations.controllers";

const router = express.Router();

router.route("/:id").get(getOrganizationById);

export { router };
