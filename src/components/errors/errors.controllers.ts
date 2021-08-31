import { Request, Response, NextFunction } from "express";
import ApiError from "./error";

const notFoundHandler = (_req: Request, _res: Response, next: NextFunction) => {
  const err = new ApiError("Route not found", 404);
  next(err);
};

const apiErrorHandler = (
  err: ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(err.statusCode).json({
    message: err.message,
  });
};

export default { notFoundHandler, apiErrorHandler };
