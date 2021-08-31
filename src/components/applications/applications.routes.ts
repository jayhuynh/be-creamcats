import express from "express";
import controllers from "./applications.controllers";

const router = express.Router();

router.route("/").post(controllers.addApplication);

export default router;
