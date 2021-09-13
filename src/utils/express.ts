import { Request } from "express";

export interface AuthorizedRequest extends Request {
  userId: number;
}
