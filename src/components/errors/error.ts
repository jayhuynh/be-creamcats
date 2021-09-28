export interface ApiErrorInput {
  statusCode: number;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;

  constructor(apiErrorInput: ApiErrorInput) {
    super(apiErrorInput.message);
    this.statusCode = apiErrorInput.statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 400,
      message,
    });
  }
}

export class AuthError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 401, // https://stackoverflow.com/a/32752617/16495552
      message,
    });
  }
}

/**
 * Try no retreive a non-existing object
 **/
export class NotFoundError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 404,
      message,
    });
  }
}

/**
 * Occurs when the request body does not match the required schema
 * Note that we only use this when validating the body
 * Use BadRequestError - statusCode 400 instead when validating path and query params
 * Status code is 422:
 * - https://stackoverflow.com/a/10323055/16495552
 */
export class SchemaError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 422,
      message,
    });
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 409, // https://stackoverflow.com/a/3826024/16495552
      message,
    });
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 503, // https://stackoverflow.com/a/1434358
      message,
    });
  }
}
