import express from "express";
import { ApiError } from "./error";

export const notFoundHandler = (
  _req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) => {
  const err = new ApiError({
    statusCode: 404,
    message: "Route not found",
  });
  next(err);
};

export const apiErrorHandler = (
  err: Error,
  _req: express.Request,
  res: express.Response,
  _next: express.NextFunction
) => {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  res.status(statusCode).json({
    message: err.message,
  });
};
