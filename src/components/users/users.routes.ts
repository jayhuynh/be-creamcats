import express from "express";
import { authorizeUser } from "../auth";
import { getUserProfileOfMe } from "./users.controllers";

const router = express.Router();

router.route("/me").get(authorizeUser, getUserProfileOfMe);

export { router };
