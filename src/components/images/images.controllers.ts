import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextFunction, Response, Request } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";

import { s3Client } from "../../utils";
import { DatabaseError, SchemaError } from "../errors";

export const uploadImages = expressAsyncHandler(
  async (req, res: Response, next: NextFunction) => {
    const filenames = [];

    if (req.files instanceof Array) {
      for (const file of req.files) {
        const filename = new Date().getTime() + file.originalname;
        filenames.push(filename);
        const command = new PutObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET,
          Key: filename,
          Body: file.buffer,
          ContentType: file.mimetype,
        });
        try {
          await s3Client.send(command);
        } catch (e) {
          return next(new DatabaseError(e.message));
        }
      }
    }

    res.status(200).json({
      filenames: filenames,
    });
  }
);

export const getImage = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let key;
    try {
      key = await Joi.string().required().validateAsync(req.params.key);
    } catch (e) {
      return next(new SchemaError(e.message));
    }

    console.log(`KEY = ${key}`);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET,
      Key: key,
    });

    let result;
    try {
      result = await s3Client.send(command);
      // console.log(`RESULTTTTT: ${Object.keys(result)}`);
      console.log(`BODY: ${Object.keys(result.Body)}`);
      // console.log(`::::: ${Object.keys(result.Body._readableState)}`);
    } catch (e) {
      return next(new DatabaseError(e.message));
    }

    res.status(200).json({
      message: "OK",
      // result: result,
    });
  }
);
