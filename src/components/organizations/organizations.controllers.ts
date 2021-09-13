import { Organization } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import expressAsyncHandler from "express-async-handler";
import Joi from "joi";

import { prisma } from "../../utils";
import {
  NotFoundError,
  BadRequestError,
} from "../errors";

export const getOrganizationById = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { error, value: id } = Joi.number().integer().validate(req.params.id);

    if (error) {
      next(new BadRequestError(error.message));
      return;
    }

    try {
      const organization: Organization = await prisma.organization.findUnique({
        where: { id },
      });
      if (organization) {
        res.status(200).json(organization);
      } else {
        next(new NotFoundError(`Organization with id ${id} not found`));
        return;
      }
    } catch (e) {
      next(e);
      return;
    }
  }
);