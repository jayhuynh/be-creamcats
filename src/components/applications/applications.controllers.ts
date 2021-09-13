import { Application } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";
import { AuthorizedRequest } from "../../utils/express";

import { prisma } from "../../utils";
import {
  ConflictError,
  SchemaError,
  NotFoundError,
  BadRequestError,
} from "../errors";

export const getApplicationById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: id } = Joi.number().integer().validate(req.params.id);

    if (error) {
      return next(new BadRequestError(error.message));
    }

    try {
      const application: Application = await prisma.application.findUnique({
        where: { id },
      });
      if (application) {
        return res.status(200).json(application);
      } else {
        return next(new NotFoundError(`Application with id ${id} not found`));
      }
    } catch (e) {
      return next(e);
    }
  }
);

export const getApplicationsOfMe = expressAsyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      const applications = await prisma.application.findMany({
        where: {
          userId: req.userId,
        },
      });
      return res.status(200).json(applications);
    } catch (e) {
      return next(e);
    }
  }
);

export const addApplication = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      userId: Joi.number().integer().required(),
      positionId: Joi.number().integer().required(),
      notes: Joi.string(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new SchemaError(error.message));
    }

    const { userId, positionId, notes } = value;

    let existingApplication: Application;
    try {
      existingApplication = await prisma.application.findUnique({
        where: {
          userId_positionId: {
            userId,
            positionId,
          },
        },
      });
    } catch (e) {
      return next(e);
    }
    if (existingApplication) {
      return next(
        new ConflictError(
          "Application with the same userId and positionId already exists"
        )
      );
    }

    try {
      await prisma.application.create({
        data: {
          userId,
          positionId,
          notes,
        },
      });
    } catch (e) {
      return next(e);
    }

    return res.status(200).json({
      message: "Application successfully added",
    });
  }
);
