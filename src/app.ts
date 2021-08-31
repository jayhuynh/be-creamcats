import express from "express";
import swaggerUi from "swagger-ui-express";

import dummies from "./components/dummies";
import utils from "./utils";
import errors from "./components/errors";

const app = express();

// Swagger for api doc
app.use("/api-doc", swaggerUi.serve, swaggerUi.setup(utils.swaggerDocument));

// Logging
app.use(utils.logger);

// Json parsing middleware
app.use(express.json());

// Dummies
app.use("/dummies", dummies.router);

// Error Handling
app.use("*", errors.controllers.notFoundHandler);
app.use(errors.controllers.apiErrorHandler);

export default app;
