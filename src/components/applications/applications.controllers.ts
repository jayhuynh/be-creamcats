import { Application } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";

import { prisma } from "../../utils";
import { ApiError, MissingAttributeError, NotFoundError } from "../errors";

export const getApplication = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const application: Application = await prisma.application.findUnique({
        where: {
          userId_positionId: {
            userId: req.body.userId,
            positionId: req.body.positionId,
          },
        },
      });
      if (application) {
        res.status(200).json(application);
      } else {
        next(new NotFoundError("Application not found"));
      }
    } catch (e) {
      next(e);
    }
  }
);

export const addApplication = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    if (!req.body.userId) {
      next(new MissingAttributeError("userId"));
    }
    if (!req.body.positionId) {
      next(new MissingAttributeError("positionId"));
    }
    if (!req.body.notes) {
      next(new MissingAttributeError("notes"));
    }
    let existingApplication: Application;
    try {
      existingApplication = await prisma.application.findUnique({
        where: {
          userId_positionId: {
            userId: req.body.userId,
            positionId: req.body.positionId,
          },
        },
      });
    } catch (e) {
      next(e);
    }
    if (existingApplication) {
      next(
        new ApiError({
          statusCode: 409,
          message:
            "Application with the same userId and positionId already exists",
        })
      );
    }
    try {
      await prisma.application.create({
        data: {
          userId: req.body.userId,
          positionId: req.body.positionId,
          notes: req.body.notes,
        },
      });
    } catch (e) {
      next(e);
    }
    res.status(200).json({
      message: "Application successfully added",
    });
  }
);
