import { Post, User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { AuthorizedRequest } from "../../utils/express";
import Joi from "joi";
import { prisma } from "../../utils";
import { AuthError, SchemaError, ConflictError } from "../errors";

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

export const createPost = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      title: Joi.string(),
      thumbnail: Joi.string(),
      content: Joi.string(),
      userId: Joi.number().integer(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new SchemaError(error.message));
    }

    const { title, thumbnail, content, userId } = value;

    let existingUser: User;
    try {
      existingUser = await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch (e) {
      return next(e);
    }
    if (!existingUser) {
      return next(new ConflictError("User with the id does not exist"));
    }

    try {
      await prisma.post.create({
        data: {
          title: title,
          thumbnail: thumbnail,
          content: content,
          User: {
            connect: {
              id: userId,
            },
          },
        },
      });
    } catch (e) {
      return next(e);
    }

    return res.status(200).json({
      message: "Sharing zone post successfully created",
    });
  }
);
