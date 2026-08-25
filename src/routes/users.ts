import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Erro ao buscar usuários"
    });
  }
});

export default router;