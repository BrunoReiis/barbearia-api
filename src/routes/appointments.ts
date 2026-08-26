import { Router, Response } from "express";
import prisma from "../lib/prisma.js";
import { AuthenticatedRequest, requireAuth } from "../lib/auth.js";

const router = Router();

router.post("/", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  const { date, time, barberId, serviceId } = req.body as {
    date?: string;
    time?: string;
    barberId?: number;
    serviceId?: number;
  };

  if (!req.userId || !date || !time || !barberId || !serviceId) {
    res.status(400).json({ message: "Data, horário, barbeiro e serviço são obrigatórios" });
    return;
  }

  try {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      res.status(400).json({ message: "Data inválida" });
      return;
    }
    const appointmentDate = new Date(`${date}T00:00:00`);
    const [dateYear, dateMonth, dateDay] = date.split("-").map(Number);
    if (Number.isNaN(appointmentDate.getTime()) || appointmentDate.getFullYear() !== dateYear || appointmentDate.getMonth() !== dateMonth - 1 || appointmentDate.getDate() !== dateDay) {
      res.status(400).json({ message: "Data inválida" });
      return;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (appointmentDate <= today) {
      res.status(400).json({ message: "Só é possível agendar a partir de amanhã" });
      return;
    }

    const [hour, minute] = time.split(":").map(Number);
    if (!/^\d{2}:\d{2}$/.test(time) || !Number.isInteger(hour) || !Number.isInteger(minute) || minute % 30 !== 0) {
      res.status(400).json({ message: "Escolha um horário em intervalos de 30 minutos" });
      return;
    }

    const businessHour = await prisma.businessHour.findUnique({
      where: { dayOfWeek: appointmentDate.getDay() },
    });
    if (!businessHour?.enabled) {
      res.status(400).json({ message: "A barbearia está fechada nesta data" });
      return;
    }

    const [openHour, openMinute] = businessHour.openTime.split(":").map(Number);
    const [closeHour, closeMinute] = businessHour.closeTime.split(":").map(Number);
    const requestedMinutes = hour * 60 + minute;
    const openingMinutes = openHour * 60 + openMinute;
    const closingMinutes = closeHour * 60 + closeMinute;
    if (requestedMinutes < openingMinutes || requestedMinutes >= closingMinutes) {
      res.status(400).json({ message: `Escolha um horário entre ${businessHour.openTime} e ${businessHour.closeTime}` });
      return;
    }

    const conflict = await prisma.appointment.findFirst({
      where: { date: appointmentDate, time, barberId, status: { not: "cancelado" } },
    });
    if (conflict) {
      res.status(409).json({ message: "Este horário não está mais disponível" });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: { date: appointmentDate, time, barberId, serviceId, userId: req.userId },
      include: { barber: true, service: true },
    });
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao criar agendamento" });
  }
});

router.get("/mine", requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const appointments = await prisma.appointment.findMany({
      where: { userId: req.userId },
      orderBy: [{ date: "asc" }, { time: "asc" }],
      include: { barber: true, service: true },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao buscar agendamentos" });
  }
});

export default router;
