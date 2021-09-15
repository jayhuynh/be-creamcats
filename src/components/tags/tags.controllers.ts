import Joi from "joi";
import { NextFunction, Response } from "express";
import expressAsyncHandler from "express-async-handler";

import { AuthorizedRequest, prisma } from "../../utils";
import { BadRequestError } from "../errors";

export const searchTag = expressAsyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    console.log(`q = ${req.query.q}`);
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
