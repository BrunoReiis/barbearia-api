import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
const router = Router();
const jwtSecret = process.env.JWT_SECRET ?? "barbearia-dev-secret-change-me";
function createToken(user) {
    return jwt.sign({ sub: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: "7d" });
}
function publicUser(user) {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
}
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
        res.status(400).json({ message: "Nome, email e senha são obrigatórios" });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres" });
        return;
    }
    try {
        const passwordHash = await bcrypt.hash(password, 12);
        const user = await prisma.user.create({
            data: { name: name.trim(), email: email.trim().toLowerCase(), passwordHash, role: "usuario" }
        });
        res.status(201).json({ token: createToken(user), user: publicUser(user) });
    }
    catch (error) {
        if (error instanceof Error && error.message.includes("Unique constraint")) {
            res.status(409).json({ message: "Este email já está cadastrado" });
            return;
        }
        console.error(error);
        res.status(500).json({ message: "Erro ao criar usuário" });
    }
});
router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
        res.status(400).json({ message: "Email e senha são obrigatórios" });
        return;
    }
    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
        res.status(401).json({ message: "Email ou senha inválidos" });
        return;
    }
    res.json({ token: createToken(user), user: publicUser(user) });
});
router.get("/me", async (req, res) => {
    const authorization = req.headers.authorization;
    const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : null;
    if (!token) {
        res.status(401).json({ message: "Token não informado" });
        return;
    }
    try {
        const payload = jwt.verify(token, jwtSecret);
        const user = payload.sub ? await prisma.user.findUnique({ where: { id: payload.sub } }) : null;
        if (!user) {
            res.status(401).json({ message: "Usuário não encontrado" });
            return;
        }
        res.json({ user: publicUser(user) });
    }
    catch {
        res.status(401).json({ message: "Token inválido ou expirado" });
    }
});
export default router;
