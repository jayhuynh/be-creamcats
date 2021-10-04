import multer from "multer";
import express from "express";
import { getImage, uploadImages } from "./images.controllers";
import { SchemaError } from "../errors";

const imageStorage = multer.memoryStorage();

const imageFilter = (_req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new SchemaError("Not an image file"), false);
  }
};

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
});

const router = express.Router();

router.route("/").post(imageUpload.array("images"), uploadImages);
router.route("/:key").get(getImage);

export { router };
