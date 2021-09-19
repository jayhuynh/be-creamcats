import { Position } from "@prisma/client";
import { Request, Response, NextFunction, RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";
import fetch from "node-fetch";

import { BadRequestError, NotFoundError } from "../errors";
import { prisma } from "../../utils";

interface GetPositionsResult {
  total: number;
  data: Array<object>;
}

export const getPositions: RequestHandler = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const querySchema = Joi.object({
      sort: Joi.string().valid("applications"),
      order: Joi.string().valid("asc", "desc"),
      gender: Joi.string().valid("male", "female"),
      tags: Joi.array(),
      dayfrom: Joi.date(),
      dayto: Joi.date(),
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
      address: Joi.string(),
      lng: Joi.number(),
      lat: Joi.number(),
      within: Joi.number(),
    })
      .with("sort", "order")
      .with("lng", "lat")
      .nand("address", "lng");

    const { error, value: query } = querySchema.validate(req.query);

    if (error) {
      return next(new BadRequestError(error.message));
    }

    if (query.sort) {
      try {
        return res.status(200).json(await getPositionsWithSort(query));
      } catch (e) {
        return next(e);
      }
    } else {
      try {
        return res.status(200).json(await getPositionsWithFilters(query));
      } catch (e) {
        return next(e);
      }
    }
  }
);

const getPositionsWithSort = async (
  query: any
): Promise<GetPositionsResult> => {
  interface Pagination {
    limit: number;
    offset: number;
  }

  const buildQuery = (pagination: Pagination) => {
    let sql = "";
    if (!pagination) sql += `SELECT COUNT(*) FROM (`;
    sql += `
      SELECT "Position".*
      FROM "Position"
      JOIN (
        SELECT "Position"."id" as "positionId", COUNT(*) AS cnt
        FROM "Position", "Application"
        WHERE "Position"."id" = "Application"."positionId"
        GROUP BY "Position"."id"
      ) AS st
      ON "Position"."id" = st."positionId" ORDER BY st.cnt
      `;
    if (pagination) {
      sql += ` LIMIT ${pagination.limit} `;
      sql += ` OFFSET ${pagination.offset}; `;
    } else {
      sql += `) as t;`;
    }
    return sql;
  };

  const totalSql = buildQuery(undefined);
  const dataSql = buildQuery({
    limit: query.limit,
    offset: query.offset ? query.offset : 0,
  });
  const total = await prisma.$queryRaw(totalSql);
  const data = await prisma.$queryRaw(dataSql);
  return {
    total: total[0].count,
    data: data,
  };
};

const getPositionsWithFilters = async (
  query: any
): Promise<GetPositionsResult> => {
  let address: any;

  if (query.address) {
    address = await queryAddress(query.address);
    if (query.address && !address) {
      throw new NotFoundError(`Address ${query.address} does not exist.`);
    }
  }

  const lng = query.lng || address.lng || null;
  const lat = query.lat || address.lat || null;

  const dayfrom = query.dayfrom
    ? new Date(query.dayfrom).toISOString()
    : undefined;
  const dayto = query.dayto ? new Date(query.dayto).toISOString() : undefined;

  interface BuildQueryInput {
    select: string;
    paginate: string;
  }

  const buildQuery = (input: BuildQueryInput) => {
    let sql = "";
    if (input.select) sql += input.select;
    sql += `
          FROM "Position", "Event"
          WHERE "Position"."eventId" = "Event"."id"
        `;

    if (query.gender) {
      sql += `AND "Position"."gender" ilike '${query.gender}'`;
    }
    if (query.dayfrom) {
      sql += `AND "Event"."startTime" >= '${dayfrom}'`;
    }
    if (query.dayto) {
      sql += `AND "Event"."endTime" <= '${dayto}'`;
    }
    if (query.tags && query.tags.length) {
      sql += `
            AND "Position"."id" IN(
            SELECT "Position"."id"
            FROM "Position", "Tag", "_PositionToTag"
            WHERE "Position"."id" = "_PositionToTag"."A"
            AND "_PositionToTag"."B" = "Tag"."id"
            AND (
          `;
      for (let i = 0; i < query.tags.length; i++) {
        if (i > 0) sql += " OR ";
        sql += `"Tag"."name" = '${query.tags[i]}'`;
      }
      sql += `)
            GROUP BY "Position"."id"
            HAVING COUNT("Position"."id") > 0
          `;
      sql += `)`;
    }

    if (query.address) {
      sql += `
          AND ST_DWithin("Event"."coor", ST_MakePoint(${lng}, ${lat}), ${query.within})
          ORDER BY
          "Event".coor <-> ST_MakePoint(${lng}, ${lat})::geography
        `;
    }
    if (input.paginate) sql += input.paginate;
    return sql;
  };

  let paginate = "";
  if (query.limit) paginate += `LIMIT ${query.limit}`;
  if (query.offset) paginate += `OFFSET ${query.offset}`;
  const totalSql = buildQuery({
    select: "SELECT COUNT(*)",
    paginate: undefined,
  });
  const dataSql = buildQuery({
    select: `SELECT "Position".*, "Event".location`,
    paginate: paginate,
  });

  const total = await prisma.$queryRaw(totalSql);
  const data = await prisma.$queryRaw(dataSql);
  return {
    total: total[0].count,
    data: data,
  };
};

const queryAddress = async (address: string): Promise<Object | null> => {
  const key = process.env.GEO_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${key}`;
  const response = await fetch(url);
  const json = await response.json();
  if (json.status !== "OK") {
    return null;
  }
  const lng = json.results[0].geometry.location.lng;
  const lat = json.results[0].geometry.location.lat;
  return {
    address: address,
    lng: lng,
    lat: lat,
  };
};

export const getPositionById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: id } = Joi.number().integer().validate(req.params.id);

    if (error) {
      return next(new BadRequestError(error.message));
    }

    try {
      const position: Position = await prisma.position.findUnique({
        where: { id },
      });
      if (position) {
        return res.status(200).json(position);
      } else {
        return next(new NotFoundError(`Position with id ${id} not found`));
      }
    } catch (e) {
      return next(e);
    }
  }
);
