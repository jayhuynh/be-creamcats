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
  let statusCode = 500;
  let message = "Fatal error...";
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }
  res.status(statusCode).json({
    message: message,
  });
};
