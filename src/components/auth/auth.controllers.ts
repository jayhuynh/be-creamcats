import argon2 from "argon2";
import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

import { prisma } from "../../utils/prisma";
import expressAsyncHandler from "express-async-handler";
import { ConflictError, AuthError, NotFoundError } from "../errors";

const login = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      next(new NotFoundError("User not found"));
    }

    try {
      if (await argon2.verify(user.password, password)) {
        const token = jwt.sign({ userId: user.id }, "secret");
        return res.status(200).json({ success: true, token });
      }
      next(new AuthError("Invalid Password"));
    } catch (e) {
      next(e);
    }
  }
);

const register = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, fullname, password } = req.body;

    const result = await prisma.user.findUnique({ where: { email } });

    if (result) {
      next(new ConflictError("User already exists"));
    }

    const hashedPwd = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email,
        fullname,
        password: hashedPwd,
      },
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET
    );

    return res.status(200).json({ success: true, accessToken: token });
  }
);

const checkAvailableEmail = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { username: email } = req.body;

    const result = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (result) {
      next(new ConflictError("User already exists"));
    }

    return res.status(200).json({
      success: true,
      message: `Email ${email} is available!`,
    });
  }
);

export default {
  login,
  register,
  checkAvailableEmail,
};
