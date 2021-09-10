import dotenv from "dotenv";
import appRoot from "app-root-path";

import app from "./app";

dotenv.config();

app.set("port", process.env.APP_CONT_PORT || 3000);

const server = app.listen(app.get("port"), () => {
  console.log(`App running on port ${app.get("port")}`);
  console.log(`App publish on port ${process.env.APP_HOST_PORT} to host machine`);
  console.log(`Root path: ${appRoot.path}`);
});

export default server;
