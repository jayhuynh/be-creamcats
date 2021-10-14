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
    if (organizationId) {
      let result;
      try {
        result = await getApplicationsOfOrganization(organizationId, req.query);
      } catch (e) {
        return next(e);
      }
      res.status(200).json(result);
    }
  }
);

export const createApplication = expressAsyncHandler(
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

export const getApplicationsOfOrganization = async (
  organizationId: number,
  query: any
) => {
  const querySchema = Joi.object({
    gender: Joi.string().valid("male", "female", "other"),
    eventId: Joi.number().integer(),
    positionId: Joi.number().integer(),
    search: Joi.string(),
    sort: Joi.string().valid("applicantName", "appliedAt"),
    order: Joi.string().valid("asc", "desc"),
    limit: Joi.number().integer(),
    offset: Joi.number().integer(),
  }).with("sort", "order");

  const values = await querySchema.validateAsync(query).catch((e) => {
    throw new SchemaError(e.message);
  });

  values.gender = values.gender?.toUpperCase();

  let sql = `
    SELECT
      usr.id as "applicantId",
      usr.fullname as "applicantName",
      eve.id as "eventId",
      eve.name as "eventName",
      pos.id as "positionId",
      pos.name as "positionName",
      usr.gender as "gender",
      application.id as "applicationId",
      application."timeCreated" as "appliedAt",
      application.status as "status"
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
  `;

  const conds: string[] = [];
  conds.push(`org.id = ${organizationId}`);
  if (values.gender) {
    conds.push(`usr.gender = '${values.gender}'`);
  }
  if (values.eventId) {
    conds.push(`eve.id = ${values.eventId}`);
  }
  if (values.positionId) {
    conds.push(`pos.id = ${values.positionId}`);
  }
  if (values.search) {
    conds.push(
      `(usr.fullname || eve.name || pos.name) ILIKE '%${values.search}%'`
    );
  }

  sql += `WHERE ${conds.join(" AND ")}`;

  const countSql = `SELECT COUNT(*) FROM ( ${sql} ) as cnt_table;`;

  if (values.sort) {
    sql += `
      ORDER BY "${values.sort}" ${values.order}
    `;
  }
  sql += values.limit ? ` LIMIT ${values.limit} ` : ``;
  sql += values.offset ? ` OFFSET ${values.offset} ` : ``;

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
      applicationId: Joi.number().integer().required(),
      applicantId: Joi.number().integer().required(),
      applicantName: Joi.string().required(),
      eventId: Joi.number().integer().required(),
      eventName: Joi.string().required(),
      positionId: Joi.number().integer().required(),
      positionName: Joi.string().required(),
      gender: Joi.string().valid("MALE", "FEMALE", "OTHER").required(),
      appliedAt: Joi.string().isoDate().required(),
      status: Joi.string().valid("PENDING", "ACCEPTED", "REJECTED").required(),
    })
  );

  const result = await resultSchema.validateAsync(rawResult).catch((e) => {
    throw new SchemaError(e.message);
  });

  const applications = result.map((el: any) => {
    return {
      id: el.applicationId,
      status: el.status,
      applicant: {
        id: el.applicantId,
        fullname: el.applicantName,
        appliedAt: el.appliedAt,
        gender: el.gender,
      },
      event: {
        id: el.eventId,
        name: el.eventName,
      },
      position: {
        id: el.positionId,
        name: el.positionName,
      },
    };
  });

  return {
    total: total,
    data: applications,
  };
};

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

export const updateApplicationById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const applicationId = await Joi.number()
        .integer()
        .validateAsync(req.params.id)
        .catch((e) => {
          throw new SchemaError(e.message);
        });

      const querySchema = Joi.object({
        status: Joi.string().valid("PENDING", "ACCEPTED", "REJECTED"),
        feedback: Joi.string(),
      });

      const { status, feedback } = await querySchema
        .validateAsync(req.query)
        .catch((e) => {
          throw new SchemaError(e.message);
        });

      const application: Application = await prisma.application.findUnique({
        where: { id: applicationId },
      });

      if (!application) {
        throw new NotFoundError(
          `Application with id ${applicationId} not found`
        );
      }

      const updatedApplication: Application = await prisma.application.update({
        where: { id: applicationId },
        data: {
          status: status ? status : undefined,
          feedback: feedback ? feedback : undefined,
        },
      });

      res.status(200).json(updatedApplication);
    } catch (e) {
      return next(e);
    }
  }
);
