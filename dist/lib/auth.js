import jwt from "jsonwebtoken";
const jwtSecret = process.env.JWT_SECRET ?? "barbearia-dev-secret-change-me";
export function requireAuth(req, res, next) {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
        res.status(401).json({ message: "Token não informado" });
        return;
    }
    try {
        const payload = jwt.verify(token, jwtSecret);
        const userId = Number(payload.sub);
        if (!userId)
            throw new Error("invalid subject");
        req.userId = userId;
        next();
    }
    catch {
        res.status(401).json({ message: "Token inválido ou expirado" });
    }
}
