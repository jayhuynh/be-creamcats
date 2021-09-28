import { User } from "@prisma/client";
import { Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";

import { AuthorizedRequest } from "../../utils/express";
import { prisma } from "../../utils";
import { AuthError } from "../errors";

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
