import app from "./app";

app.set("port", process.env.PORT || 3000);

const server = app.listen(app.get("port"), () => {
  console.log(`App running on port ${app.get("port")}`);
});

export default server;
