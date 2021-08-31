import express from "express";
import ApiError from "./error";

const notFoundHandler = (
  _req: express.Request,
  _res: express.Response,
  next: express.NextFunction
) => {
  const err = new ApiError("Route not found", 404);
  next(err);
};

const apiErrorHandler = (
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

export default { notFoundHandler, apiErrorHandler };
