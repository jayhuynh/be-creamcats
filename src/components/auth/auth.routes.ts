import { Router } from "express";
import controllers from "./auth.controllers";
import auth from "../../middleware/auth";

const router = Router();

router.route("/login").post(controllers.login);

router.route("/register").post(controllers.register);

router
  .route("/username")
  .post(auth, (req, res) => res.send(req.body.user.username));

router.post("/username/availability");

export default router;
