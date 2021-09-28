import argon2 from "argon2";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

import { AuthorizedRequest } from "../../utils/express";
import { prisma } from "../../utils/prisma";
import {
  ConflictError,
  AuthError,
  NotFoundError,
  SchemaError,
  BadRequestError,
  DatabaseError,
} from "../errors";

interface JwtPayload {
  accountId: number;
  accountType: "volunteer" | "organization";
}

const jwtSign = (payload: JwtPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const login = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      type: Joi.string().valid("volunteer", "organization").required(),
    });

    const { error, value } = schema.validate(req.body);

    if (error) {
      return next(new SchemaError(error.message));
    }

    const { email, password, type } = value;

    let accountId;

    if (type === "volunteer") {
      let user;
      try {
        user = await prisma.user.findUnique({ where: { email } });
      } catch (e) {
        return next(new DatabaseError(e.message));
      }
      if (!user) {
        return next(new NotFoundError("User not found"));
      }
      if (!(await argon2.verify(user.password, password))) {
        return next(new AuthError("Invalid password for volunteer account"));
      }
      accountId = user.id;
    } else if (type === "organization") {
      let organization;
      try {
        organization = await prisma.organization.findUnique({
          where: { email },
        });
      } catch (e) {
        return next(new DatabaseError(e.message));
      }
      if (!organization) {
        return next(new NotFoundError("Organization not found"));
      }
      if (!(await argon2.verify(organization.password, password))) {
        return next(new AuthError("Invalid password for organization account"));
      }
      accountId = organization.id;
    }

    const payload: JwtPayload = { accountId: accountId, accountType: type };

    try {
      const token = jwtSign(payload);
      return res.status(200).json({ accessToken: token });
    } catch (e) {
      return next(new AuthError(e.message));
    }
  }
);

export const register = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      type: Joi.string().valid("volunteer", "organization").required(),
    });
    const { error, value } = schema.validate(req.body);
    if (error) {
      return next(new SchemaError(error.message));
    }

    const { email, type } = value;
    const password = await argon2.hash(value.password);

    let accountId;

    if (type === "volunteer") {
      let existingUser;
      try {
        existingUser = await prisma.user.findUnique({ where: { email } });
      } catch (e) {
        return next(new DatabaseError(e.message));
      }
      if (existingUser) {
        return next(
          new ConflictError(`User with email ${email} already exists`)
        );
      }
      let user;
      try {
        user = await prisma.user.create({
          data: {
            email,
            password,
          },
        });
      } catch (e) {
        return next(e);
      }
      accountId = user.id;
    } else {
      let existingOrganization;
      try {
        existingOrganization = await prisma.organization.findUnique({
          where: { email },
        });
      } catch (e) {
        return next(new DatabaseError(e.message));
      }
      if (existingOrganization) {
        return next(
          new ConflictError(`Organization with email ${email} already exists`)
        );
      }
      let organization;
      try {
        organization = await prisma.organization.create({
          data: {
            email,
            password,
          },
        });
      } catch (e) {
        return next(e);
      }
      accountId = organization.id;
    }

    const payload: JwtPayload = { accountId: accountId, accountType: type };
    const token = jwtSign(payload);
    return res.status(200).json({ accessToken: token });
  }
);

export const checkAvailableEmail = expressAsyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      type: Joi.string().valid("volunteer", "organization").required(),
    });

    const { error, value } = schema.validate(req.query);
    const { email, type } = value;

    if (error) {
      return next(new BadRequestError(error.message));
    }

    if (type === "volunteer") {
      let existingUser;
      try {
        existingUser = await prisma.user.findUnique({ where: { email } });
      } catch (e) {
        return next(new DatabaseError(e.message));
      }

      if (existingUser) {
        return next(
          new ConflictError("Email of volunteer has already been used")
        );
      }
    } else {
      let existingOrganization;
      try {
        existingOrganization = await prisma.organization.findUnique({
          where: { email },
        });
      } catch (e) {
        return next(new DatabaseError(e.message));
      }

      if (existingOrganization) {
        return next(
          new ConflictError("Email of organization has already been used")
        );
      }
    }

    return res.status(200).json({
      message: `Email ${email} is available for account type ${type}`,
    });
  }
);

/**
 * Decode and check the authorization header
 * Returns the decoded payload
 **/
export const decodeAuthHeader = (req: AuthorizedRequest) => {
  if (!req.headers.authorization) {
    throw new AuthError("Missing Authorization Header");
  }
  const authHeader = req.headers.authorization;
  const [authMethod, token] = authHeader.split(" ");
  if (!authMethod || !token) {
    throw new AuthError("Invalid Authorization Header");
  }
  if (authMethod !== "Bearer") {
    throw new AuthError("Invalid Auth Method");
  }
  const decoded: any = jwt.verify(token, process.env.JWT_SECRET);
  if (!decoded.accountType) {
    throw new AuthError("accountType missing from jwt payload");
  }
  if (!decoded.accountId) {
    throw new AuthError("accountId missing from jwt payload");
  }
  if (["volunteer", "organization"].indexOf(decoded.accountType) == -1) {
    throw new AuthError(`Invalid accountType ${decoded.accountType}`);
  }
  return decoded;
};

export const authorizeAccount = expressAsyncHandler(
  async (req: AuthorizedRequest, _res: Response, next: NextFunction) => {
    let decoded;
    try {
      decoded = decodeAuthHeader(req);
    } catch (e) {
      return next(e);
    }

    if (decoded.accountType === "volunteer") {
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { id: decoded.accountId },
        });
      } catch (e) {
        return next(new DatabaseError(e.message));
      }

      if (!user) {
        return next(new AuthError("User does not exist"));
      }
    } else {
      let organization;
      try {
        organization = await prisma.organization.findUnique({
          where: { id: decoded.accountId },
        });
      } catch (e) {
        return next(new DatabaseError(e.message));
      }

      if (!organization) {
        return next(new AuthError("Organization does not exist"));
      }
    }
    // TODO: check decoded.iat against last password-change instance
    Object.assign(req, decoded);
    req.log.info(
      `Account of type "${req.accountType}" and id ${req.accountId} authorized!`
    );
    return next();
  }
);

export const authorizeUser = expressAsyncHandler(
  async (req: AuthorizedRequest, _res: Response, next: NextFunction) => {
    let decoded;
    try {
      decoded = decodeAuthHeader(req);
    } catch (e) {
      return next(e);
    }

    if (decoded.accountType !== "volunteer") {
      return next(new AuthError("Not a volunteer account"));
    }

    let user;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.accountId },
      });
    } catch (e) {
      return next(new DatabaseError(e.message));
    }

    if (!user) {
      return next(new AuthError("User does not exist"));
    }

    Object.assign(req, decoded);

    req.log.info(`Volunteer account of id ${req.accountId} authorized!`);
    return next();
  }
);

export const authorizeOrganization = expressAsyncHandler(
  async (req: AuthorizedRequest, _res: Response, next: NextFunction) => {
    let decoded;
    try {
      decoded = decodeAuthHeader(req);
    } catch (e) {
      return next(e);
    }
    if (decoded.accountType !== "organization") {
      return next(new AuthError("Not an organization account"));
    }

    let organization;
    try {
      organization = await prisma.organization.findUnique({
        where: { id: decoded.accountId },
      });
    } catch (e) {
      return next(new DatabaseError(e.message));
    }

    if (!organization) {
      return next(new AuthError("Organization does not exist"));
    }

    Object.assign(req, decoded);

    req.log.info(`Organization account of id ${req.accountId} authorized!`);
    return next();
  }
);
