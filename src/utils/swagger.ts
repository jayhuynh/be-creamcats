import yaml from "yamljs";

const swaggerDocument = yaml.load("./api-docs/swagger.yaml");

export default swaggerDocument;
