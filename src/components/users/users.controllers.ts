import { User } from "@prisma/client";
import { Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";

import { AuthorizedRequest } from "../../utils/express";
import { prisma } from "../../utils";

export const getUserProfileOfMe = expressAsyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      const user: User = await prisma.user.findUnique({
        where: {
          id: req.userId,
        },
      });
      return res.status(200).json(user);
    } catch (e) {
      return next(e);
    }
  }
);
