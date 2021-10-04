import { Organization } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";

import { prisma } from "../../utils";
import {
  NotFoundError,
  BadRequestError,
  SchemaError,
  ConflictError,
} from "../errors";

export const getOrganizationById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: id } = Joi.number().integer().validate(req.params.id);

    if (error) {
      return next(new BadRequestError(error.message));
    }

    try {
      const organization: Organization = await prisma.organization.findUnique({
        where: { id },
      });
      if (organization) {
        return res.status(200).json(organization);
      } else {
        return next(new NotFoundError(`Organization with id ${id} not found`));
      }
    } catch (e) {
      return next(e);
    }
  }
);

export const createOrganization = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      name: Joi.string(),
      desc: Joi.string(),
      addr: Joi.string(),
      phone: Joi.string(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new SchemaError(error.message));
    }

    const { email, name, desc, addr, phone } = value;

    let existingOrganization: Organization;
    try {
      existingOrganization = await prisma.organization.findUnique({
        where: { email },
      });
    } catch (e) {
      return next(e);
    }
    if (existingOrganization) {
      return next(
        new ConflictError("Organization with the same email already exists")
      );
    }

    try {
      await prisma.organization.create({
        data: {
          email: email,
          name: name,
          desc: desc,
          addr: addr,
          phone: phone,
        },
      });
    } catch (e) {
      return next(e);
    }

    return res.status(200).json({
      message: "Organization successfully created",
    });
  }
);
