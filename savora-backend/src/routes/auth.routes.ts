import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { registerSchema, loginSchema } from "../validators";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validate(registerSchema), AuthController.register);
router.post("/login", validate(loginSchema), AuthController.login);
router.get("/me", authMiddleware, AuthController.getMe);

export default router;