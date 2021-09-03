import { NextFunction, Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import jwt, { JwtPayload } from "jsonwebtoken";
import { AuthError } from "../errors";

export const auth = expressAsyncHandler(
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
      next(new AuthError("Missing Authorization Header"));
    }

    const authHeader = req.headers.authorization;
    const authMethod = authHeader.split(" ")[0];
    const token = authHeader.split(" ")[1];

    if (!authMethod || !token) {
      next(new AuthError("Invalid Authorization Header"));
    }
    if (authMethod !== "Bearer") {
      next(new AuthError("Invalid Auth Method"));
    }

    let tokenBody;

    try {
      tokenBody = jwt.verify(token, "secret");
      req.body.user = tokenBody;
    } catch (e) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid Token", invalidate: true });
      next();
    }

    next();
  }
);

export default auth;
