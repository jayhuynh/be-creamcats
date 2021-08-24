import express from "express";
import PinoHttp from "pino-http";

const app = express();

// Logging
app.use(PinoHttp());

// Json parsing middleware
app.use(express.json());

export default app;
