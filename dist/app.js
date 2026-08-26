import "dotenv/config";
import express from "express";
import cors from "cors";
import usersRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import appointmentsRoutes from "./routes/appointments.js";
const app = express();
app.use(cors());
app.use(express.json());
app.get("/", (_req, res) => {
    res.json({
        message: "API da Barbearia funcionando!"
    });
});
app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/appointments", appointmentsRoutes);
export default app;
