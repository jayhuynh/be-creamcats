import { Application } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";
import { AuthorizedRequest } from "../../utils/express";

import { prisma } from "../../utils";
import {
  ConflictError,
  SchemaError,
  NotFoundError,
  BadRequestError,
  AuthError,
  DatabaseError,
} from "../errors";

export const getApplications = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let organizationId: number;
    try {
      organizationId = await Joi.number()
        .integer()
        .validateAsync(req.params.organizationId);
    } catch (e) {
      return next(new SchemaError(e.message));
    }
    let limit: number | undefined;
    let offset: number | undefined;
    try {
      const query = await Joi.object({
        limit: Joi.number().integer(),
        offset: Joi.number().integer(),
      })
        .with("limit", "offset")
        .validateAsync(req.query);
      limit = query.limit;
      offset = query.offset;
    } catch (e) {
      return next(new SchemaError(e.message));
    }
    if (organizationId) {
      res
        .status(200)
        .json(
          await getApplicationsOfOrganization(organizationId, limit, offset)
        );
    }
  }
);

export const getApplicationsOfOrganization = async (
  organizationId: number,
  limit: number | undefined,
  offset: number | undefined
) => {
  let sql = `
    SELECT
      usr.id as user_id,
      usr.fullname as user_fullname,
      eve.id as event_id,
      eve.name as event_name,
      pos.id as position_id,
      pos.name as position_name,
      usr.gender as gender,
      application."timeCreated" as applied_at
    FROM
      "Application" as application
        JOIN(
          SELECT
            usr.id as id,
            usr.fullname as fullname,
            usr.gender as gender
          FROM
            "User" as usr
        ) AS usr ON usr.id = application."userId"
        JOIN (
          SELECT
            pos.id as id,
            pos.name as name,
            pos."eventId" as eve_id
          FROM
            "Position" as pos
        ) AS pos ON pos.id = application."positionId"
        JOIN (
          SELECT
            eve.id as id,
            eve.name as name,
            eve."organizationId" as org_id
          FROM
            "Event" as eve
        ) AS eve ON pos.eve_id = eve.id
        JOIN (
          SELECT
            org.id as id
          FROM
            "Organization" as org
        ) AS org ON eve.org_id = org.id
    WHERE org.id = ${organizationId}
  `;

  const countSql = `SELECT COUNT(*) FROM ( ${sql} ) as cnt_table;`;
  sql += limit ? `LIMIT ${limit}` : "";
  sql += offset ? `OFFSET ${offset}` : "";

  const total: number = await prisma
    .$queryRaw(countSql)
    .then((res) => res[0].count)
    .catch((e) => {
      throw new DatabaseError(e.message);
    });

  const rawResult = await prisma.$queryRaw(sql).catch((e) => {
    throw new DatabaseError(e.message);
  });

  const resultSchema = Joi.array().items(
    Joi.object({
      user_id: Joi.number().integer().required(),
      user_fullname: Joi.string().required(),
      event_id: Joi.number().integer().required(),
      event_name: Joi.string().required(),
      position_id: Joi.number().integer().required(),
      position_name: Joi.string().required(),
      gender: Joi.string(),
      applied_at: Joi.string().isoDate(),
    })
  );

  const result = await resultSchema.validateAsync(rawResult).catch((e) => {
    throw new SchemaError(e.message);
  });

  const applications = result.map((el: any) => {
    return {
      applicant: {
        id: el.user_id,
        fullname: el.user_fullname,
        appliedAt: el.applied_at,
        gender: el.gender,
      },
      event: {
        id: el.event_id,
        name: el.event_name,
      },
      position: {
        id: el.position_id,
        name: el.position_name,
      },
    };
  });

  return {
    total: total,
    data: applications,
  };
};

export const getApplicationById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: id } = Joi.number().integer().validate(req.params.id);

    if (error) {
      return next(new BadRequestError(error.message));
    }

    try {
      const application: Application = await prisma.application.findUnique({
        where: { id },
      });
      if (application) {
        return res.status(200).json(application);
      } else {
        return next(new NotFoundError(`Application with id ${id} not found`));
      }
    } catch (e) {
      return next(e);
    }
  }
);

export const getApplicationsOfMe = expressAsyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.accountType !== "volunteer") {
      return next(
        new AuthError("Invalid permission - must be a volunteer account")
      );
    }

    try {
      const applications = await prisma.application.findMany({
        where: {
          userId: req.accountId,
        },
      });
      return res.status(200).json(applications);
    } catch (e) {
      return next(e);
    }
  }
);

export const getApplicationCountOfMe = expressAsyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.accountType !== "volunteer") {
      return next(
        new AuthError("Invalid permission - must be a volunteer account")
      );
    }

    try {
      const applications = await prisma.application.findMany({
        where: {
          userId: req.accountId,
        },
      });
      return res.status(200).json({
        count: applications.length,
      });
    } catch (e) {
      return next(e);
    }
  }
);

export const addApplication = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      userId: Joi.number().integer().required(),
      positionId: Joi.number().integer().required(),
      notes: Joi.string(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new SchemaError(error.message));
    }

    const { userId, positionId, notes } = value;

    let existingApplication: Application;
    try {
      existingApplication = await prisma.application.findUnique({
        where: {
          userId_positionId: {
            userId,
            positionId,
          },
        },
      });
    } catch (e) {
      return next(e);
    }
    if (existingApplication) {
      return next(
        new ConflictError(
          "Application with the same userId and positionId already exists"
        )
      );
    }

    try {
      await prisma.application.create({
        data: {
          userId,
          positionId,
          notes,
        },
      });
    } catch (e) {
      return next(e);
    }

    return res.status(200).json({
      message: "Application successfully added",
    });
  }
);
