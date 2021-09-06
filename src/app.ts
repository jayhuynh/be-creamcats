import express from "express";
import swaggerUi from "swagger-ui-express";

import { router as authRouter } from "./components/auth";
import { router as applicationsRouter } from "./components/applications";
import { router as dummiesRouter } from "./components/dummies";
import { notFoundHandler, apiErrorHandler } from "./components/errors";
import { logger, swaggerRouter } from "./utils";

const app = express();

// Swagger for api doc
app.use("/api-doc", swaggerRouter);

// Logging
app.use(logger);

// Json parsing middleware
app.use(express.json());

// Auth
app.use("/auth", authRouter);

// Dummies
app.use("/dummies", dummiesRouter);

// Applications
app.use("/applications", applicationsRouter);

// Error Handling
app.use("*", notFoundHandler); // catch all invalid routes
app.use(apiErrorHandler); // central error-handling middleware

export default app;
