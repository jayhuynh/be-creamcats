import { User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";

import { AuthorizedRequest } from "../../utils/express";
import { prisma } from "../../utils";
import { AuthError, SchemaError, ConflictError } from "../errors";
import Joi from "joi";

export const getUserProfileOfMe = expressAsyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.accountType !== "volunteer") {
      return next(
        new AuthError("Invalid permission - must be a volunteer account")
      );
    }

    try {
      const user: User = await prisma.user.findUnique({
        where: {
          id: req.accountId,
        },
      });
      return res.status(200).json(user);
    } catch (e) {
      return next(e);
    }
  }
);

export const updateUserProfile = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      userId: Joi.number().integer().required(),
      fullname: Joi.string(),
      age: Joi.number().integer(),
      profilePic: Joi.string(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new SchemaError(error.message));
    }

    const { userId, fullname, age, profilePic } = value;

    let existingUser: User;
    try {
      existingUser = await prisma.user.findUnique({
        where: {
          id: userId,
        },
      });
    } catch (e) {
      return next(e);
    }
    if (!existingUser) {
      return next(new ConflictError("User with the same id does not exist"));
    }

    try {
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          fullname: fullname,
          age: age,
          profilePic: profilePic,
        },
      });
    } catch (e) {
      return next(e);
    }

    return res.status(200).json({
      message: "User Profile successfully updated",
    });
  }
);
