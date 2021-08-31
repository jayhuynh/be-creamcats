import { Application } from "@prisma/client";
import express from "express";
import expressAsyncHandler from "express-async-handler";

import prisma from "../../utils/prisma";
import ApiError from "../errors/error";

const addApplication = expressAsyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (!req.body.userId) {
      next(new ApiError("Attribute userId missing from request body", 422));
    }
    if (!req.body.positionId) {
      next(new ApiError("Attribute positionId missing from request body", 422));
    }
    if (!req.body.notes) {
      next(new ApiError("Attribute notes missing from request body", 422));
    }
    let existingApplication: Application;
    try {
      existingApplication = await prisma.application.findUnique({
        where: {
          unique_userId_positionId_pair: {
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
        new ApiError(
          "Application with the same userId and positionId already exists",
          409
        )
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

export default { addApplication };
