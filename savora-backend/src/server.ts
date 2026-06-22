import dotenv from "dotenv";
dotenv.config();

import { checkEnvVariables } from "./config/envCheck";
checkEnvVariables();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import { apiLimiter, authLimiter } from "./middlewares/rateLimiter";

import restaurantRoutes from "./routes/restaurant.routes";
import categoryRoutes from "./routes/category.routes";
import menuRoutes from "./routes/menu.routes";
import cartRoutes from "./routes/cart.routes";
import orderRoutes from "./routes/order.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import userRoutes from "./routes/user.routes";
import reviewRoutes from "./routes/review.routes";
import promoRoutes from "./routes/promo.routes";
import path from "path";
import { createServer } from "http";
import { initSocket } from "./socket";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://10.59.50.198:3000", 
  "http://192.168.31.21:3000",
  "http://10.222.26.198:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: function (origin, callback) {
    // Web-only API using Bearer tokens: strictly enforce explicitly listed origins.
    // We do not allow undefined origins (!origin) to prevent non-browser clients (like Postman or cURL)
    // from bypassing CORS when they shouldn't, ensuring tighter perimeter security.
    if (origin && allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(helmet());
app.use("/api", apiLimiter);

// Local uploads no longer used

import authRoutes from "./routes/auth.routes";

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/promos", promoRoutes);

import { errorMiddleware } from "./middlewares/error.middleware";
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

const server = createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
