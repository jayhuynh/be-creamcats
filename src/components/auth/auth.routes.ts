import { Router } from "express";
import controllers from "./auth.controllers";
import auth from "./auth";

const router = Router();

router.route("/login").post(controllers.login);

router.route("/register").post(controllers.register);

router.route("/email").post(auth, (req, res) => res.send(req.body.user.email));

router.post("/email/availability");

export { router };
