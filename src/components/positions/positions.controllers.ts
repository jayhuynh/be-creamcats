import { Position } from "@prisma/client";
import { Request, Response, NextFunction, RequestHandler } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";
import fetch from "node-fetch";

import { BadRequestError, NotFoundError } from "../errors";
import { prisma } from "../../utils";

export const getPositions: RequestHandler = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const querySchema = Joi.object({
      sort: Joi.string().valid("applications", "distance", "timecreated"),
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

    const sort = query.sort;
    const order = query.order;
    const gender = query.gender;
    const tags = query.tags;
    const parseDay = (s: string) => (s ? new Date(s).toDateString() : null);
    const dayfrom = parseDay(query.dayfrom);
    const dayto = parseDay(query.dayto);
    const limit = query.limit;
    const offset = query.offset;
    let address: any;
    if (!query.address || !(address = await queryAddress(query.address))) {
      return next(
        new NotFoundError(`Address ${query.address} does not exist.`)
      );
    }
    const lng = query.lng || address.lng;
    const lat = query.lat || address.lat;
    const within = query.within;

    let sql = `
      SELECT
        pos.id as id,
        pos.name as name,
        pe.eve_id as "eventId",
        pa.application_cnt as "applicationCount"
      FROM
        "Position" as pos
        JOIN (
          SELECT
            pos.id as pos_id,
            COUNT(*) AS application_cnt
          FROM "Position" as pos, "Application" as app
          WHERE pos.id = app."positionId"
          GROUP BY pos.id
        ) AS pa ON pos.id = pa.pos_id
        JOIN (
          SELECT
            pos.id as pos_id,
            eve."id" as eve_id,
            eve."startTime" as eve_st,
            eve."endTime" as eve_et,
            eve."coor" as coor
          FROM "Position" as pos, "Event" as eve
          WHERE pos."eventId" = eve.id
        ) AS pe ON pos.id = pe.pos_id
      WHERE
    `;

    let conds = [];

    if (tags) {
      let tagCond = `
        pos.id IN (
          SELECT pos.id as pos_id
          FROM "Position" as pos, "_PositionToTag" as ptot, "Tag" as tag
          WHERE pos.id = ptot."A"
            AND ptot."B" = tag.id
            AND (
      `;
      for (let i = 0; i < tags.length; i++) {
        if (i !== 0) tagCond += ` OR `;
        tagCond += `
              tag.name = '${tags[i]}'
        `;
      }
      tagCond += `
            )
          GROUP BY pos_id
          HAVING COUNT(pos.id) > 0
        )
      `;
      conds.push(tagCond);
    }

    if (gender) {
      conds.push(`
        pos.gender ILIKE '${gender}'
      `);
    }
    if (dayfrom) {
      conds.push(`
        pe.eve_st >= '${dayfrom}'
      `);
    }
    if (dayto) {
      conds.push(`
        pe.eve_et <= '${dayto}'
      `);
    }
    if (within) {
      conds.push(`
        ST_DWITHIN(pe.coor, ST_MAKEPOINT(${lng}, ${lat}), ${within})
      `);
    }

    sql += conds.join(" AND ");

    if (sort === "applications") {
      sql += `
        ORDER BY "applicationCount" ${order}
      `;
    } else if (sort === "distance") {
      sql += `
        ORDER BY pe.coor <-> ST_MakePoint(${lng}, ${lat})::geography ${order}
      `;
    } else if (sort === "timecreated") {
      sql += `
        ORDER BY pos."timeCreated" ${order}
      `;
    }

    const countSql = `SELECT COUNT(*) FROM ( ${sql} ) as ct;`;

    sql += limit ? `LIMIT ${limit}` : "";
    sql += offset ? `OFFSET ${offset}` : "";

    let total;
    let data;

    try {
      total = await prisma.$queryRaw(countSql);
      data = await prisma.$queryRaw(sql);
    } catch (e) {
      return next(e);
    }

    for (let position of data) {
      const queriedPosition = await prisma.position.findUnique({
        where: {
          id: position.id,
        },
        include: {
          tags: true,
        },
      });
      Object.assign(position, queriedPosition);
      position.tags = position.tags.map((tag: any) => tag.name);
    }

    return res.status(200).json({
      total: total[0].count,
      data: data,
    });
  }
);

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
