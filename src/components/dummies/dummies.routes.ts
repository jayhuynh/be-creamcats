import express from "express";
import * as controllers from "./dummies.controllers";

const router = express.Router();

router.route("/").get(controllers.getDummies);

export { router };
