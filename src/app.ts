import express from "express";

import dummies from "./components/dummies";
import utils from "./utils";

const app = express();

// Logging
app.use(utils.logger);

// Json parsing middleware
app.use(express.json());

// Dummies
app.use("/dummies", dummies.controllers.getDummies);

export default app;
