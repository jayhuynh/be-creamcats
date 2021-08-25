import express from "express";

const getDummies = (request: express.Request, response: express.Response) => {
  response.status(200).json({
    status: "success",
  });
};

const addDummies = (request: express.Request, response: express.Response) => {
  response.status(200).json({
    status: "success",
  });
};

export default { getDummies, addDummies };
