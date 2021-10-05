import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextFunction, Response, Request } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";

import { s3Client, toS3PublicUrl } from "../../utils";
import { DatabaseError, SchemaError } from "../errors";

export const uploadImages = expressAsyncHandler(
  async (req, res: Response, next: NextFunction) => {
    const filenames: string[] = [];

    if (req.files instanceof Array) {
      for (const file of req.files) {
        const filename: string = new Date().getTime() + file.originalname;
        filenames.push(filename);
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        });
        try {
          const result = await s3Client.send(command);
        } catch (e) {
          return next(new DatabaseError(e.message));
        }
      }
    }

    const url = filenames.map(toS3PublicUrl);

    res.status(200).json(url);
  }
);
