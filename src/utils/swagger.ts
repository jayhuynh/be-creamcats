import yaml from "yamljs";

const swaggerDocument = yaml.load("./api-doc/swagger.yaml");

export default swaggerDocument;
