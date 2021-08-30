import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import auth from "../utils/auth";

const router = Router();

const prisma = new PrismaClient();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  // const user = await prisma.user({username});

  if (!user) {
    return res.status(400).json({ success: false, error: "User not found" });
  }

  try {
    if (await argon2.verify(user.hash, password)) {
      const token = jwt.sign({ userId: user.id }, "secret");

      return res.status(200).json({ success: true, token });
    }
    return res.status(400).json({ success: false, error: "Invalid Password" });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

router.post("/register", async (req, res) => {
  const { email, username, password } = req.body;

  console.log(email, username, password);

  const result = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (result) {
    return res
      .status(400)
      .json({ success: false, error: "User already exists" });
  }

  const hash = await argon2.hash(password);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      hash,
    },
  });

  const token = jwt.sign({ userId: user.id }, process.env.ACCESS_TOKEN_SECRET);

  return res.status(200).json({ success: true, accessToken: token });
});

router.post("/username", auth, (req, res) => res.send(req.user.username));

router.post("/username/availability", async (req, res) => {
  const { username } = req.body;

  const result = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  if (result) {
    return res
      .status(400)
      .json({ success: false, error: "User already exists" });
  }
  return res.json({
    success: true,
    message: `Username ${username} is available!`,
  });
});

export { router as default };
