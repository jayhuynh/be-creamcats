import express from "express";
import { auth } from "../auth";
import {
  getUserProfileOfMe,
} from "./users.controllers";

const router = express.Router();

router.route("/me").get(auth, getUserProfileOfMe);

export { router };
