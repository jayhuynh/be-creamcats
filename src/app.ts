import express from "express";

import logger from "./utils/logger";
import dummies from "./components/dummies";
import auth from "./components/auth";

const app = express();

// Logging
app.use(logger);

// Json parsing middleware
app.use(express.json());

// Auth
app.use("/auth", auth.router);

// Dummies
app.use("/dummies", dummies.router);

export default app;
