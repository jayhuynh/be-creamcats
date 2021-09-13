import argon2 from "argon2";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

import { prisma } from "../../utils/prisma";
import {
  ConflictError,
  AuthError,
  NotFoundError,
  SchemaError,
  BadRequestError,
} from "../errors";

export const login = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return next(new NotFoundError("User not found"));
    }

    try {
      if (await argon2.verify(user.password, password)) {
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
          expiresIn: process.env.JWT_EXPIRES_IN,
        });
        return res.status(200).json({ accessToken: token });
      }
      return next(new AuthError("Invalid Password"));
    } catch (e) {
      return next(e);
    }
  }
);

export const register = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      fullname: Joi.string(),
      password: Joi.string().required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new SchemaError(error.message));
    }

    const { email, fullname, password } = value;

    const result = await prisma.user.findUnique({ where: { email } });

    if (result) {
      return next(new ConflictError("User already exists"));
    }

    const hashedPwd = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        fullname,
        password: hashedPwd,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    return res.status(200).json({ accessToken: token });
  }
);

export const checkAvailableEmail = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: email } = Joi.string()
      .email()
      .validate(req.params.email);

    if (error) {
      return next(new BadRequestError(error.message));
    }

    const result = await prisma.user.findUnique({ where: { email } });

    if (result) {
      return next(new ConflictError("Email has already been used"));
    }

    return res.status(200).json({
      message: `Email ${email} is available!`,
    });
  }
);
