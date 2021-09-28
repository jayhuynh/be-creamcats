import Joi from "joi";
import { Request, NextFunction, Response } from "express";
import expressAsyncHandler from "express-async-handler";

import { prisma } from "../../utils";
import { BadRequestError } from "../errors";

export const getTags = expressAsyncHandler(
  async (_req: Request, res: Response) => {
    const tags = await prisma.tag.findMany({});
    const tagNames = tags.map((tag) => tag.name);
    res.status(200).json(tagNames);
  }
);

export const searchTag = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const querySchema = Joi.object({
      q: Joi.string().required(),
    });

    const { error: schemaError, value: query } = querySchema.validate(
      req.query
    );

    if (schemaError) {
      return next(new BadRequestError(schemaError.message));
    }

    try {
      const tags = await prisma.tag.findMany({
        where: {
          name: {
            startsWith: query.q,
          },
        },
      });
      return res.status(200).json(tags);
    } catch (e) {
      return next(e);
    }
  }
);
