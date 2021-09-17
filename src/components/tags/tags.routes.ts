import express from "express";
import { getTags, searchTag } from "./tags.controllers";

const router = express.Router();

router.route("/").get(getTags);
router.route("/search").get(searchTag);

export { router };
