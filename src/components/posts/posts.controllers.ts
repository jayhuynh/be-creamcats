import { Post, User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import { AuthorizedRequest } from "../../utils/express";
import Joi from "joi";
import { prisma } from "../../utils";
import {
  AuthError,
  SchemaError,
  ConflictError,
  DatabaseError,
} from "../errors";

export const getPosts = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const querySchema = Joi.object({
        sort: Joi.string().valid("timeCreated"),
        order: Joi.string().valid("asc", "desc"),
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
      }).with("sort", "order");
      const query = await querySchema.validateAsync(req.query).catch((e) => {
        throw new SchemaError(e.message);
      });

      let orderBy = undefined;

      if (query.sort) {
        if (query.sort === "timeCreated") {
          orderBy = {
            timeCreated: query.order,
          };
        }
      }

      const total = await prisma.post
        .aggregate({
          _count: {
            id: true,
          },
        })
        .then((result) => result._count.id)
        .catch((e) => {
          throw new DatabaseError(e.message);
        });

      const posts = await prisma.post
        .findMany({
          orderBy: orderBy,
          take: query.limit,
          skip: query.offset,
        })
        .catch((e) => {
          throw new DatabaseError(e.message);
        });

      const result = {
        total: total,
        data: posts,
      };

      return res.status(200).json(result);
    } catch (e) {
      return next(e);
    }
  }
);

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
    try {
      const schema = Joi.object({
        title: Joi.string(),
        thumbnail: Joi.string(),
        content: Joi.string(),
        userId: Joi.number().integer(),
      });

      const { title, thumbnail, content, userId } = await schema
        .validateAsync(req.body)
        .catch((e) => {
          throw new SchemaError(e.message);
        });

      const existingUser: User = await prisma.user
        .findUnique({
          where: { id: userId },
        })
        .catch((e) => {
          throw new DatabaseError(e);
        });

      if (!existingUser) {
        throw new ConflictError("User with the id does not exist");
      }

      const post: Post = await prisma.post
        .create({
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
        })
        .catch((e) => {
          throw new DatabaseError(e.message);
        });

      return res.status(200).json(post);
    } catch (e) {
      return next(e);
    }
  }
);
