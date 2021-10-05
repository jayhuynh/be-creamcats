import express from "express";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";

const swaggerRouter = express.Router();
const swaggerDocument = yaml.load("./api-doc/swagger.yaml");
swaggerRouter.use("/", swaggerUi.serve);
swaggerRouter.get("/", swaggerUi.setup(swaggerDocument));

export { swaggerRouter };
