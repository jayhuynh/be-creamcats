import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

function auth(req: Request, res: Response, next: NextFunction): any {
  if (!req.headers.authorization) {
    return res
      .status(400)
      .json({ success: false, error: "Missing Authorization Header" });
  }

  const authHeader = req.headers.authorization;
  const authMethod = authHeader.split(" ")[0];
  const token = authHeader.split(" ")[1];

  if (!authMethod || !token) {
    return res
      .status(400)
      .json({ success: false, error: "Invalid Authorization Header" });
  }
  if (authMethod !== "Bearer") {
    return res
      .status(400)
      .json({ success: false, error: "Invalid Auth Method" });
  }

  let tokenBody;

  try {
    tokenBody = jwt.verify(token, "secret");
    req.body.user = tokenBody;
    // return tokenBody;
  } catch {
    return res
      .status(400)
      .json({ success: false, error: "Invalid Token", invalidate: true });
  }
  return next();
}

export default auth;
