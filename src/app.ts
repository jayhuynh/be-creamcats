import express from "express";
import cors from "cors";

import { router as authRouter } from "./components/auth";
import { router as applicationsRouter } from "./components/applications";
import { router as dummiesRouter } from "./components/dummies";
import { router as positionsRouter } from "./components/positions";
import { routeNotFoundHandler, apiErrorHandler } from "./components/errors";
import { logger, swaggerRouter } from "./utils";

const app = express();

// Enable cors
app.use(cors());

// Swagger for api doc
app.use("/api-doc", swaggerRouter);

// Logging
app.use(logger);

// Json parsing middleware
app.use(express.json());

app.use("/auth", authRouter);

app.use("/dummies", dummiesRouter);
app.use("/applications", applicationsRouter);
app.use("/positions", positionsRouter);

// Error Handling
app.use("*", routeNotFoundHandler); // catch all invalid routes
app.use(apiErrorHandler); // central error-handling middleware

export default app;
