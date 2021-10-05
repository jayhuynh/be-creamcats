import multer from "multer";
import express from "express";
import { uploadImages } from "./images.controllers";
import { SchemaError } from "../errors";

const imageFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new SchemaError("Not an image file"), false);
  }
};

const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
});

const router = express.Router();

router.route("/").post(imageUpload.array("images"), uploadImages);

export { router };
