import { Event } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";

import { prisma } from "../../utils";
import { NotFoundError, BadRequestError } from "../errors";

export const getEventById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: id } = Joi.number().integer().validate(req.params.id);

    if (error) {
      return next(new BadRequestError(error.message));
    }

    try {
      const event: Event = await prisma.event.findUnique({
        where: { id },
      });
      if (event) {
        return res.status(200).json(event);
      } else {
        return next(new NotFoundError(`Event with id ${id} not found`));
      }
    } catch (e) {
      return next(e);
    }
  }
);
