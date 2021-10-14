import { Organization } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import { AuthorizedRequest } from "../../utils/express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";

import { prisma } from "../../utils";
import {
  NotFoundError,
  BadRequestError,
  AuthError,
  SchemaError,
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

export const getOrgProfile = expressAsyncHandler(
  async (req: AuthorizedRequest, res: Response, next: NextFunction) => {
    if (req.accountType !== "organization") {
      return next(
        new AuthError("Invalid permission - must be a organization account")
      );
    }

    try {
      const organization: Organization = await prisma.organization.findUnique({
        where: {
          id: req.accountId,
        },
      });
      return res.status(200).json(organization);
    } catch (e) {
      return next(e);
    }
  }
);

export const updateOrganization = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const organizationId = await Joi.number()
        .integer()
        .validateAsync(req.params.id)
        .catch((e) => {
          throw new SchemaError(e.message);
        });

      const querySchema = Joi.object({
        email: Joi.string().email(),
        name: Joi.string(),
        desc: Joi.string(),
        addr: Joi.string(),
        phone: Joi.string(),
        profilePic: Joi.string(),
      });

      const { email, name, desc, addr, phone, profilePic } = await querySchema
        .validateAsync(req.query)
        .catch((e) => {
          throw new SchemaError(e.message);
        });

      const organization: Organization = await prisma.organization.findUnique({
        where: { id: organizationId },
      });

      if (!organization) {
        throw new NotFoundError(
          `Organization with id ${organizationId} not found`
        );
      }

      const updatedOrganization: Organization =
        await prisma.organization.update({
          where: { id: organizationId },
          data: {
            email: email ? email : undefined,
            name: name ? name : undefined,
            desc: desc ? desc : undefined,
            addr: addr ? addr : undefined,
            phone: phone ? phone : undefined,
            profilePic: profilePic ? profilePic : undefined,
          },
        });

      res.status(200).json(updatedOrganization);
    } catch (e) {
      return next(e);
    }
  }
);
