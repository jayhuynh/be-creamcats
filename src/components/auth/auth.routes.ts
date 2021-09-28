import { Router } from "express";
import { login, register, checkAvailableEmail } from "./auth.controllers";

const router = Router();

router.route("/login").post(login);

router.route("/register").post(register);

router.route("/email").get(checkAvailableEmail);

export { router };
