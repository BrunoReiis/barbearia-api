import { Router } from "express";
import prisma from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
const router = Router();
async function ensureCatalog() {
    const [barberCount, serviceCount, hourCount] = await Promise.all([
        prisma.barber.count(),
        prisma.service.count(),
        prisma.businessHour.count(),
    ]);
    if (!barberCount) {
        await prisma.barber.createMany({
            data: [
                { name: "Rafael Lima", specialty: "Cortes clássicos" },
                { name: "Caio Mendes", specialty: "Barba e navalha" },
                { name: "Victor Hugo", specialty: "Cortes modernos" },
            ],
        });
    }
    if (!serviceCount) {
        await prisma.service.createMany({
            data: [
                { name: "Corte clássico", description: "Corte na tesoura ou máquina", duration: 45, price: 35 },
                { name: "Barba completa", description: "Toalha quente e acabamento", duration: 30, price: 25 },
                { name: "Corte + barba", description: "O ritual completo da casa", duration: 75, price: 55 },
            ],
        });
    }
    if (!hourCount) {
        await prisma.businessHour.createMany({
            data: [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ dayOfWeek, openTime: "09:00", closeTime: "19:00" })),
        });
    }
}
router.get("/", requireAuth, async (_req, res) => {
    try {
        await ensureCatalog();
        const [barbers, services, hours, appointments] = await Promise.all([
            prisma.barber.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
            prisma.service.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
            prisma.businessHour.findMany({ orderBy: { dayOfWeek: "asc" } }),
            prisma.appointment.findMany({
                where: { status: { not: "cancelado" } },
                orderBy: [{ date: "asc" }, { time: "asc" }],
                take: 20,
                include: { barber: true, service: true },
            }),
        ]);
        res.json({ barbers, services, hours, appointments });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro ao carregar dados do dashboard" });
    }
});
export default router;
