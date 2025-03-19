import express, { Request, Response } from "express";
import cors from "cors";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/auth.js";
import tilsRoutes from "./routes/tils.js";
import usersRoutes from "./routes/users.js";

const app = express();
const port = process.env.PORT || 3001;

// Request logger
app.use((req: Request, res: Response, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const color = status >= 500 ? "🔴" : status >= 400 ? "🟡" : "🟢";
    console.log(`${color} ${req.method} ${status} ${ms}ms ${req.url}`);
  });
  next();
});

// Configure middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ["Content-Length", "Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  }),
);

app.use(express.json());

// Mount routes
app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tils", tilsRoutes);
app.use("/api/users", usersRoutes);

// Start server
app.listen(port, () => {
  console.log("✨ Server is running on port", port);
});
