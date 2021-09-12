import { Position } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";

import { BadRequestError, NotFoundError } from "../errors";
import { prisma } from "../../utils";
import { Dict } from "../../utils/types";

export const getPositions = expressAsyncHandler(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Position[]> => {
    const querySchema = Joi.object({
      sort: Joi.string().valid("applications"),
      order: Joi.string().valid("asc", "desc"),
    }).with("sort", "order");

    const { error, value: query } = querySchema.validate(req.query);

    if (error) {
      next(new BadRequestError(error.message));
      return;
    }

    if (query.sort) {
      try {
        const sortedPositions: Position[] = await getPositionsSortedBy(
          query.sort,
          query.order
        );
        res.status(200).json(sortedPositions);
        return;
      } catch (e) {
        next(e);
        return;
      }
    } else {
      try {
        const positions = await prisma.position.findMany({});
        res.status(200).json(positions);
        return;
      } catch (e) {
        next(e);
        return;
      }
    }
  }
);

async function getPositionsSortedBy(
  sort: "applications",
  order: "asc" | "desc"
): Promise<Position[]> {
  const sortedPositionIds: number[] = await getPositionIdsSortedBy(sort, order);
  const unsortedPositions: Position[] = await prisma.position.findMany({
    where: { id: { in: sortedPositionIds } },
  });
  const d: Dict<Position> = {};
  unsortedPositions.forEach((position) => (d[position.id] = position));
  const sortedPositions = sortedPositionIds.map((id) => d[id]);
  return sortedPositions;
}

async function getPositionIdsSortedBy(
  sort: "applications",
  order: "asc" | "desc"
): Promise<number[]> {
  if (sort === "applications") {
    const groupBy = await prisma.application.groupBy({
      by: ["positionId"],
      _count: {
        userId: true,
      },
      orderBy: {
        _count: {
          userId: order,
        },
      },
    });
    const positionIds = groupBy.map((application) => application.positionId);
    return positionIds;
  }
}

export const getPositionById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: id } = Joi.number().integer().validate(req.params.id);

    if (error) {
      next(new BadRequestError(error.message));
      return;
    }

    try {
      const position: Position = await prisma.position.findUnique({
        where: { id },
      });
      if (position) {
        res.status(200).json(position);
      } else {
        next(new NotFoundError(`Position with id ${id} not found`));
        return;
      }
    } catch (e) {
      next(e);
      return;
    }
  }
);