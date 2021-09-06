import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import jwt from "jsonwebtoken";

import { AuthError } from "../errors";

export const auth = expressAsyncHandler(
  (req: Request, _res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      next(new AuthError("Missing Authorization Header"));
      return;
    }

    const authHeader = req.headers.authorization;
    const authMethod = authHeader.split(" ")[0];
    const token = authHeader.split(" ")[1];

    if (!authMethod || !token) {
      next(new AuthError("Invalid Authorization Header"));
      return;
    }
    if (authMethod !== "Bearer") {
      next(new AuthError("Invalid Auth Method"));
      return;
    }

    let tokenBody;

    try {
      tokenBody = jwt.verify(token, "secret");
      req.body.user = tokenBody;
    } catch (e) {
      next(new AuthError("Invalid Token"));
      return;
    }

    next();
  }
);
