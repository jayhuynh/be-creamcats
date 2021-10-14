import express from "express";
import { authorizeUser } from "../auth";
import { getPostsOfMe, createPost } from "./posts.controllers";

const router = express.Router();

router.route("/").post(createPost);
router.route("/me").get(authorizeUser, getPostsOfMe);

export { router };
