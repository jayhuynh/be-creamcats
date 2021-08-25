import express from "express";
import dummiesControllers from "./dummies.controllers";

const router = express.Router();
router.route("/").get(dummiesControllers.getDummies);

export default router;
