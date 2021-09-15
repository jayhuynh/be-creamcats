import express from "express";
import { searchTag } from "./tags.controllers";

const router = express.Router();

router.route("/search").get(searchTag);

export { router };
