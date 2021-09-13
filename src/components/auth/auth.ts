import { NextFunction, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import { AuthorizedRequest } from "../../utils/express";
import { prisma } from "../../utils";
import { AuthError } from "../errors";

export const auth = expressAsyncHandler(
  async (req: AuthorizedRequest, _res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      return next(new AuthError("Missing Authorization Header"));
    }

    const authHeader = req.headers.authorization;
    const [authMethod, token] = authHeader.split(" ");

    if (!authMethod || !token) {
      return next(new AuthError("Invalid Authorization Header"));
    }
    if (authMethod !== "Bearer") {
      return next(new AuthError("Invalid Auth Method"));
    }

    let decoded: any;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return next(new AuthError("Invalid Token"));
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return next(new AuthError("User does not exist"));
    }

    // TODO: check decoded.iat against last password-change instance

    req.userId = decoded.userId;
    req.log.info(`User of id ${req.body.userId} authorized!`);
    return next();
  }
);
