import express from "express";
import {
  getPositions,
  getPositionById,
  createPosition,
} from "./positions.controllers";

const router = express.Router({ mergeParams: true });

router.route("/").post(createPosition);
router.route("/").get(getPositions);
router.route("/:id").get(getPositionById);

export { router };
