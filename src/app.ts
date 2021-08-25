import express from "express";

import dummies from "./components/dummies";
import logger from "./utils/logger";

const app = express();

// Logging
app.use(logger);

// Json parsing middleware
app.use(express.json());

// Dummies
app.use("/dummies", dummies.controllers.getDummies);

export default app;
