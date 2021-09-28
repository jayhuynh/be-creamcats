import express from "express";
import { authorizeUser } from "../auth";
import { getPostsOfMe } from "./posts.controllers";

const router = express.Router();

router.route("/me").get(authorizeUser, getPostsOfMe);

export { router };
