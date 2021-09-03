import express from "express";

export const getDummies = (
  request: express.Request,
  response: express.Response
) => {
  response.status(200).json({
    status: "success",
  });
};

export const addDummies = (
  request: express.Request,
  response: express.Response
) => {
  response.status(200).json({
    status: "success",
  });
};
