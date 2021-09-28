import { Request } from "express";

export interface AuthorizedRequest extends Request {
  accountId: number;
  accountType: "volunteer" | "organization";
}
