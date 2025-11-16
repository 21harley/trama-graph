import type { Prisma } from "@prisma/client";

import { prisma } from "../../libs/prisma";
import { AppError } from "../../shared/errors/app-error";
import { registerAlarmBreach } from "../alarms/alarms.service";
import { MeasurementInput } from "./measurements.schema";

export type MeasurementsBatchResult = {
  inserted: number;
  alarmsTriggered: number;
};

export type ListMeasurementsParams = {
  gasId?: number;
  start?: Date;
  end?: Date;
};

export type MeasurementWithRelations = Awaited<ReturnType<typeof prisma.medicion.findMany>>;

export async function listMeasurements({ gasId, start, end }: ListMeasurementsParams): Promise<MeasurementWithRelations> {
  const where: Record<string, unknown> = {};

  if (typeof gasId === "number") {
    where.idTipoGas = gasId;
  }

  if (start || end) {
    where.fechaMedida = {
      ...(start ? { gte: start } : {}),
      ...(end ? { lte: end } : {}),
    };
  }

  return prisma.medicion.findMany({
    where,
    orderBy: { fechaMedida: "desc" },
    include: { tipoDeGas: true },
  });
}

export async function deleteMeasurement(id: number): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const measurement = await tx.medicion.findUnique({ where: { id } });

    if (!measurement) {
      throw new AppError("La medición solicitada no existe", {
        statusCode: 404,
        code: "MEASUREMENT_NOT_FOUND",
      });
    }

    await tx.medicion.delete({ where: { id } });

    const relatedAlarms = await tx.alarma.findMany({ where: { listaIdMedidas: { has: id } } });

    for (const alarm of relatedAlarms) {
      const updatedMeasurements = alarm.listaIdMedidas.filter((measurementId: number) => measurementId !== id);

      await tx.alarma.update({
        where: { id: alarm.id },
        data: {
          listaIdMedidas: updatedMeasurements,
          nMedidas: updatedMeasurements.length,
          actualizadaEn: new Date(),
          ...(updatedMeasurements.length === 0 ? { estado: "cerrada" } : {}),
        },
      });
    }
  });
}

export async function registerMeasurementsBatch(data: MeasurementInput[]): Promise<MeasurementsBatchResult> {
  if (data.length === 0) {
    return { inserted: 0, alarmsTriggered: 0 };
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let alarmsTriggered = 0;
    let inserted = 0;

    for (const measurement of data) {
      const shouldPersist = measurement.valor > measurement.umbral;
      if (!shouldPersist) {
        continue;
      }

      const created = await tx.medicion.create({
        data: {
          idTipoGas: measurement.id_type_gas,
          fechaMedida: measurement.fecha,
          valor: measurement.valor,
          umbral: measurement.umbral,
        },
      });

      inserted += 1;

      await registerAlarmBreach({
        prisma: tx,
        idTipoGas: measurement.id_type_gas,
        measurementId: created.id,
        umbral: measurement.umbral,
      });
      alarmsTriggered += 1;
    }

    return { inserted, alarmsTriggered };
  });

  return result;
}
