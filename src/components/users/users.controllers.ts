import { User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";

import { AuthorizedRequest } from "../../utils/express";
import { prisma } from "../../utils";
import {
  AuthError,
  SchemaError,
  ConflictError,
  BadRequestError,
  NotFoundError,
} from "../errors";
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
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      fullname: Joi.string(),
      age: Joi.number().integer(),
      gender: Joi.string().valid("male", "female", "other"),
      profilePic: Joi.string(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new SchemaError(error.message));
    }
    const { fullname, age, gender, profilePic } = value;
    const userId = req.accountId;

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
          gender: gender.toUpperCase(),
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

export const getUserById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: id } = Joi.number().integer().validate(req.params.id);

    if (error) {
      return next(new BadRequestError(error.message));
    }

    try {
      const user: User = await prisma.user.findUnique({
        where: { id },
      });
      if (user) {
        return res.status(200).json(user);
      } else {
        return next(new NotFoundError(`User with id ${id} not found`));
      }
    } catch (e) {
      return next(e);
    }
  }
);
