import { Post } from "@prisma/client";
import { Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { AuthorizedRequest } from "../../utils/express";

import { prisma } from "../../utils";
import { AuthError } from "../errors";

export const getPostsOfMe = expressAsyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.accountType !== "volunteer") {
      return next(
        new AuthError("Invalid permission - must be a volunteer account")
      );
    }

    try {
      const posts: Post[] = await prisma.post.findMany({
        where: {
          userId: req.accountId,
        },
      });
      return res.status(200).json(posts);
    } catch (e) {
      return next(e);
    }
  }
);
