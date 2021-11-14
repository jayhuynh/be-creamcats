import { Event, Prisma, Organization } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";
import { queryAddress, QueryAddressResult } from "../../utils/maps";

import { OrganizationRequest, prisma } from "../../utils";
import {
  NotFoundError,
  BadRequestError,
  DatabaseError,
  SchemaError,
  ConflictError,
} from "../errors";

export const getEvents = expressAsyncHandler(
  async (req: OrganizationRequest, res: Response, next: NextFunction) => {
    const querySchema = Joi.object({
      status: Joi.string().valid("ongoing", "past"),
      limit: Joi.number().integer(),
      offset: Joi.number().integer(),
    });

    let query;
    try {
      query = await querySchema.validateAsync(req.query);
    } catch (e) {
      return next(new SchemaError(e.message));
    }

    let organizationId;
    try {
      organizationId = await Joi.number()
        .integer()
        .required()
        .validateAsync(req.params.organizationId);
    } catch (e) {
      return next(new SchemaError(e.message));
    }

    let whereInput: Prisma.EventWhereInput = {
      organizationId: organizationId,
    };
    if (query.status === "past") {
      Object.assign(whereInput, {
        endTime: {
          lt: new Date(Date.now()),
        },
      });
    } else if (query.status === "ongoing") {
      Object.assign(whereInput, {
        endTime: {
          gte: new Date(Date.now()),
        },
      });
    }

    let total;
    try {
      total = (
        await prisma.event.aggregate({
          _count: { id: true },
          where: whereInput,
        })
      )._count.id;
    } catch (e) {
      return next(new DatabaseError(e.message));
    }

    let events: Event[];
    try {
      events = await prisma.event.findMany({
        where: whereInput,
        take: query.limit,
        skip: query.offset,
      });
    } catch (e) {
      return next(new DatabaseError(e.message));
    }

    return res.status(200).json({
      total: total,
      data: events,
    });
  }
);

export const createEvent = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      name: Joi.string(),
      desc: Joi.string(),
      gallery: Joi.array().items(Joi.string()),
      startTime: Joi.date(),
      endTime: Joi.date(),
      location: Joi.string(),
      organizationId: Joi.number().integer(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new SchemaError(error.message));
    }

    const {
      name,
      desc,
      gallery,
      startTime,
      endTime,
      location,
      organizationId,
    } = value;

    let existingOrganization: Organization;
    try {
      existingOrganization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });
    } catch (e) {
      return next(e);
    }
    if (!existingOrganization) {
      return next(new ConflictError("Organization with the id does not exist"));
    }

    let createdEvent: Event;

    try {
      createdEvent = await prisma.event.create({
        data: {
          name: name,
          desc: desc,
          gallery: gallery,
          startTime: startTime,
          endTime: endTime,
          location: location,
          Organization: {
            connect: {
              id: organizationId,
            },
          },
        },
      });
    } catch (e) {
      return next(new DatabaseError(e.message));
    }

    const addr: QueryAddressResult = await queryAddress(location);

    if (addr) {
      const query = `UPDATE "Event" SET coor = ST_MakePoint(${addr.lng}, ${addr.lat}) WHERE location like '${addr.address}'`;
      try {
        await prisma.$executeRaw(query);
      } catch (e) {
        return next(new DatabaseError(e.message));
      }
    }

    return res.status(200).json({ createdEvent });
  }
);

export const getEventById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: id } = Joi.number().integer().validate(req.params.id);

    if (error) {
      return next(new BadRequestError(error.message));
    }

    try {
      const event: Event = await prisma.event.findUnique({
        where: { id },
      });
      if (event) {
        return res.status(200).json(event);
      } else {
        return next(new NotFoundError(`Event with id ${id} not found`));
      }
    } catch (e) {
      return next(e);
    }
  }
);

export const updateEventById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId = await Joi.number()
        .integer()
        .validateAsync(req.params.id)
        .catch((e) => {
          throw new SchemaError(e.message);
        });

      const querySchema = Joi.object({
        name: Joi.string(),
        location: Joi.string(),
        desc: Joi.string(),
        starttime: Joi.string().isoDate(),
        endtime: Joi.string().isoDate(),
      });

      const { name, location, desc, starttime, endtime } = await querySchema
        .validateAsync(req.query)
        .catch((e) => {
          throw new SchemaError(e.message);
        });

      const event: Event = await prisma.event.findUnique({
        where: { id: eventId },
      });

      if (!event) {
        throw new NotFoundError(`Event with id ${eventId} not found`);
      }

      const updatedEvent: Event = await prisma.event.update({
        where: { id: eventId },
        data: {
          name: name ?? undefined,
          location: location ?? undefined,
          desc: desc ?? undefined,
          startTime: starttime ?? undefined,
          endTime: endtime ?? undefined,
        },
      });

      res.status(200).json(updatedEvent);
    } catch (e) {
      return next(e);
    }
  }
);
