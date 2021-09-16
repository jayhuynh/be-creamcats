import { Post } from "@prisma/client";
import { Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { AuthorizedRequest } from "../../utils/express";

import { prisma } from "../../utils";

export const getPostsOfMe = expressAsyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    try {
      const posts: Post[] = await prisma.post.findMany({
        where: {
          userId: req.userId,
        },
      });
      return res.status(200).json(posts);
    } catch (e) {
      return next(e);
    }
  }
);
