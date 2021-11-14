import express from "express";
import { authorizeUser } from "../auth";
import { getPostsOfMe, createPost, getPosts } from "./posts.controllers";

const router = express.Router();

router.route("/").post(createPost).get(getPosts);
router.route("/me").get(authorizeUser, getPostsOfMe);

export { router };
