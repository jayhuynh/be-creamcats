export interface ApiErrorInput {
  statusCode: number;
  message: string;
}

export class ApiError extends Error {
  statusCode: number;

  constructor(apiErrorInput: ApiErrorInput) {
    super(apiErrorInput.message);
    this.statusCode = this.statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class AuthError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 401, // https://stackoverflow.com/a/32752617/16495552
      message: message,
    });
  }
}

// Example: find a user with a given email
export class NotFoundError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 404,
      message: message,
    });
  }
}

export class MissingAttributeError extends ApiError {
  constructor(attributeName: string) {
    super({
      statusCode: 422, // https://stackoverflow.com/a/10323055/16495552
      message: `Attribute ${attributeName} missing from request body`,
    });
  }
}

export class ConflictError extends ApiError {
  constructor(message: string) {
    super({
      statusCode: 409, // https://stackoverflow.com/a/3826024/16495552
      message: message,
    });
  }
}
