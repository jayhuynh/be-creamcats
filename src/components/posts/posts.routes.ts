import express from "express";
import { auth } from "../auth";
import {
  getPostsOfMe,
} from "./posts.controllers";

const router = express.Router();

router.route("/me").get(auth, getPostsOfMe);

export { router };
