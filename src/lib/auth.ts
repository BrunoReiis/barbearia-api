import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET ?? "barbearia-dev-secret-change-me";

export type AuthenticatedRequest = Request & { userId?: number };

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;

  if (!token) {
    res.status(401).json({ message: "Token não informado" });
    return;
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as { sub?: string | number };
    const userId = Number(payload.sub);
    if (!userId) throw new Error("invalid subject");
    req.userId = userId;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
}
