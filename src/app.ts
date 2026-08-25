import "dotenv/config";
import express, { Request, Response } from "express";
import cors from "cors";
import usersRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "API da Barbearia funcionando!"
  });
});

app.use("/api/users", usersRoutes);
app.use("/api/auth", authRoutes);

export default app;