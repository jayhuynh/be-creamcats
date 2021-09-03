import express from "express";
import * as controllers from "./applications.controllers";

const router = express.Router();

router
  .route("/")
  .get(controllers.getApplication)
  .post(controllers.addApplication);

export { router };
