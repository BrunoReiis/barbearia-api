-- CreateTable
CREATE TABLE "Barber" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "specialty" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Barber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "duration" INTEGER NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessHour" (
    "id" SERIAL NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TEXT NOT NULL,
    "closeTime" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "BusinessHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "time" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "userId" INTEGER NOT NULL,
    "barberId" INTEGER NOT NULL,
    "serviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BusinessHour_dayOfWeek_key" ON "BusinessHour"("dayOfWeek");

-- CreateIndex
CREATE INDEX "Appointment_date_idx" ON "Appointment"("date");

-- CreateIndex
CREATE INDEX "Appointment_barberId_date_time_idx" ON "Appointment"("barberId", "date", "time");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_barberId_fkey" FOREIGN KEY ("barberId") REFERENCES "Barber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
