import { PrismaClient } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

const auth = async (req: Request, res: Response, next: NextFunction) => {
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
  } catch {
    return res
      .status(400)
      .json({ success: false, error: "Invalid Token", invalidate: true });
  }

  console.log(tokenBody);

  if (!tokenBody.userId) {
    return res.status(400).json({ success: false, error: "Invalid Token" });
  }

  const user = await prisma.user.findUnique({
    where: { id: tokenBody.userId },
  });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, error: "User does not exist" });
  }

  req.user = user;

  next();
};

export { auth as default };
