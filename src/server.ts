import express, { Request, Response, NextFunction } from "express";

import consola, { Consola } from "consola";
import cors from "cors";

import * as dotENV from "dotenv";

import auth from "./components/auth";

dotENV.config();
const { PORT } = process.env;

class Server {
  public app: express.Application;

  public logger: Consola = consola;

  public constructor() {
    this.app = express();

    this.setConfig();
    this.setRequestLogger();
    this.setRoutes();
  }

  public start() {
    this.setConfig();
    this.setRequestLogger();
    this.setRoutes();

    this.app.listen(PORT, () => {
      this.logger.success(`Server started on port ${PORT}`);
    });
  }

  private setConfig() {
    this.app.use(express.json());
    this.app.use(cors());

    dotENV.config();
  }

  private setRequestLogger() {
    this.app.use(async (req: Request, res: Response, next: NextFunction) => {
      console.log(`[${req.method} - ${req.path}]`);

      next();
    });
  }

  private setRoutes() {
    this.app.get("/", (req: Request, res: Response) => {
      res.send("App");
    });

    this.app.use("/api/v1/auth", auth.router);
  }
}

export { Server as default };
