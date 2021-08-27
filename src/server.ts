import dotenv from "dotenv";

import app from "./app";

dotenv.config();

app.set("port", process.env.APP_CONT_PORT || 3000);

const server = app.listen(app.get("port"), () => {
  console.log(`App running on port ${app.get("port")}`);
});

export default server;
