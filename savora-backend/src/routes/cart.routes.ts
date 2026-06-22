import { Router } from "express";
import { getCart, addToCart, removeFromCart, clearCart } from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { addToCartSchema, removeFromCartSchema } from "../validators";

const router = Router();

router.use(authMiddleware);

router.get("/", getCart);
router.post("/add", validate(addToCartSchema), addToCart);
router.post("/remove", validate(removeFromCartSchema), removeFromCart);
router.delete("/clear", clearCart);

export default router;
