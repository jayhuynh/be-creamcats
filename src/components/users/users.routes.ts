import express from "express";
import { authorizeUser } from "../auth";
import {
  getUserProfileOfMe,
  updateUserProfile,
  getUserById,
} from "./users.controllers";

const router = express.Router();

router.route("/me").post(authorizeUser, updateUserProfile);
router.route("/me").get(authorizeUser, getUserProfileOfMe);

router.route("/:id").get(getUserById);

export { router };
