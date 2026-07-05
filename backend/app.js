import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import leaveRoutes from "./routes/leave.routes.js";
import payrollRoutes from "./routes/payroll.routes.js";

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(helmet());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/payroll", payrollRoutes);

// Test Route
app.get("/", (req, res) => {
  res.json({ success: true, message: "Backend is running" });
});

// 404 Handler for undefined API routes
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "API route not found" });
});

// Global Error Handling Middleware
// Note: Express 5 requires all 4 parameters for error handling middleware
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR OCCURRED:");
  console.error(err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {}
  });
});

export default app;