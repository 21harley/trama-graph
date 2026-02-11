import { Prisma, PrismaClient } from "@prisma/client";

import { prisma } from "../../libs/prisma";
import { AppError } from "../../shared/errors/app-error";

const DEFAULT_ALARM_STATE = "abierta";
const CLOSED_ALARM_STATE = "cerrada";
const ALARM_INACTIVITY_TIMEOUT_MS = 2000;

type InactivityTimerEntry = {
  timeout: NodeJS.Timeout;
  alarmId: number;
};

const alarmInactivityTimers = new Map<number, InactivityTimerEntry>();

function clearAlarmInactivityTimer(idTipoGas: number) {
  const existing = alarmInactivityTimers.get(idTipoGas);
  if (existing) {
    clearTimeout(existing.timeout);
    alarmInactivityTimers.delete(idTipoGas);
  }
}

function scheduleAlarmClosure(idTipoGas: number, alarmId: number) {
  clearAlarmInactivityTimer(idTipoGas);

  const timeout = setTimeout(async () => {
    try {
      await prisma.alarma.updateMany({
        where: { id: alarmId, estado: DEFAULT_ALARM_STATE },
        data: { estado: CLOSED_ALARM_STATE },
      });
    } catch (error) {
      console.error(
        `Error al cerrar la alarma ${alarmId} para el gas ${idTipoGas} tras inactividad:`,
        error,
      );
    } finally {
      const current = alarmInactivityTimers.get(idTipoGas);
      if (current && current.alarmId === alarmId) {
        alarmInactivityTimers.delete(idTipoGas);
      }
    }
  }, ALARM_INACTIVITY_TIMEOUT_MS);

  alarmInactivityTimers.set(idTipoGas, { alarmId, timeout });
}

export type AlarmRegistrationInput = {
  prisma: Prisma.TransactionClient | PrismaClient;
  idTipoGas: number;
  measurementId: number;
  umbral: number;
};

export type ListAlarmsParams = {
  gasId?: number;
  start?: Date;
  end?: Date;
  states?: string[];
};

export type AlarmWithRelations = Awaited<
  ReturnType<
    typeof prisma.alarma.findMany
  >
>;

export async function registerAlarmBreach({
  prisma,
  idTipoGas,
  measurementId,
  umbral,
}: AlarmRegistrationInput) {
  const existingAlarm = await prisma.alarma.findFirst({
    where: { idTipoGas, estado: DEFAULT_ALARM_STATE },
    orderBy: { creadaEn: "desc" },
  });

  if (!existingAlarm) {
    const created = await prisma.alarma.create({
      data: {
        idTipoGas,
        nMedidas: 1,
        listaIdMedidas: [measurementId],
        estado: DEFAULT_ALARM_STATE,
        umbralReferencia: umbral,
      },
    });

    scheduleAlarmClosure(idTipoGas, created.id);
    return;
  }

  const updated = await prisma.alarma.update({
    where: { id: existingAlarm.id },
    data: {
      nMedidas: existingAlarm.nMedidas + 1,
      listaIdMedidas: [...existingAlarm.listaIdMedidas, measurementId],
      actualizadaEn: new Date(),
    },
  });

  scheduleAlarmClosure(idTipoGas, updated.id);
}

export async function listAlarms({ gasId, start, end, states }: ListAlarmsParams): Promise<AlarmWithRelations> {
  const where: Record<string, unknown> = {};

  if (typeof gasId === "number") {
    where.idTipoGas = gasId;
  }

  if (start || end) {
    where.creadaEn = {
      ...(start ? { gte: start } : {}),
      ...(end ? { lte: end } : {}),
    };
  }

  if (states && states.length > 0) {
    where.estado = { in: states };
  }

  return prisma.alarma.findMany({
    where,
    orderBy: { creadaEn: "desc" },
    include: { tipoDeGas: true },
  });
}

export async function deleteAlarm(id: number): Promise<void> {
  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const alarm = await tx.alarma.findUnique({ where: { id } });

    if (!alarm) {
      throw new AppError("La alarma solicitada no existe", {
        statusCode: 404,
        code: "ALARM_NOT_FOUND",
      });
    }

    await tx.alarma.delete({ where: { id } });
  });
}

type GestionSnapshotInput = {
  alarms: AlarmWithRelations;
  referenceDate: Date;
  includeAlarmList: boolean;
};

type AlarmListEntry = {
  id: number;
  idTipoGas: number;
  estado: string;
  nMedidas: number;
  listaIdMedidas: number[];
  umbralReferencia: unknown;
  creadaEn: Date;
  actualizadaEn: Date;
};

type AlarmSnapshotItem = AlarmListEntry & {
  tipoDeGas: {
    id: number;
    nombre: string;
    formulaQuimica: string;
    unidadMedida: string | null;
    codigoSensor: string | null;
  } | null;
};

type AlarmListEntryJson = Omit<AlarmListEntry, "creadaEn" | "actualizadaEn"> & {
  creadaEn: string;
  actualizadaEn: string;
};

type GestionSnapshotSummary = {
  totalActivaciones: number;
  conteoPorGas: Record<string, { nombre: string | null; cantidad: number }>;
  listaAlarmas: AlarmListEntry[] | null;
};

function isAlarmSnapshotItem(value: unknown): value is AlarmSnapshotItem {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.idTipoGas === "number" &&
    typeof candidate.estado === "string" &&
    typeof candidate.nMedidas === "number" &&
    Array.isArray(candidate.listaIdMedidas)
  );
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function endOfDay(date: Date): Date {
  const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  return end;
}

export async function createGestionAlarmasSnapshot({
  alarms,
  referenceDate,
  includeAlarmList,
}: GestionSnapshotInput): Promise<GestionSnapshotSummary> {
  const day = startOfDay(referenceDate);

  const alarmList: AlarmSnapshotItem[] = Array.isArray(alarms)
    ? (alarms as unknown[]).filter(isAlarmSnapshotItem)
    : [];

  const conteoPorGas: Record<string, { nombre: string | null; cantidad: number }> = {};
  for (const alarm of alarmList) {
    const key = String(alarm.idTipoGas);
    const nombre = alarm.tipoDeGas?.nombre ?? null;
    if (!conteoPorGas[key]) {
      conteoPorGas[key] = { nombre, cantidad: 0 };
    }
    conteoPorGas[key].cantidad += 1;
  }

  const listaAlarmas: AlarmListEntry[] | null = includeAlarmList
    ? alarmList.map(({ tipoDeGas: _ignored, ...entry }) => entry)
    : null;

  const summary: GestionSnapshotSummary = {
    totalActivaciones: alarmList.length,
    conteoPorGas,
    listaAlarmas,
  };

  const listaAlarmasJson: AlarmListEntryJson[] | null = summary.listaAlarmas
    ? summary.listaAlarmas.map(({ creadaEn, actualizadaEn, ...entry }) => ({
        ...entry,
        creadaEn: creadaEn.toISOString(),
        actualizadaEn: actualizadaEn.toISOString(),
      }))
    : null;

  const prismaNullTypes = Prisma as unknown as {
    JsonNull?: unknown;
    NullTypes?: { JsonNull?: unknown };
  };

  const prismaJsonNull = prismaNullTypes.JsonNull ?? prismaNullTypes.NullTypes?.JsonNull ?? null;
  const listaAlarmasValue =
    listaAlarmasJson !== null ? (listaAlarmasJson as any) : (prismaJsonNull as any);

  await prisma.gestionAlarmas.upsert({
    where: { fechaReferencia: day },
    create: {
      fechaReferencia: day,
      totalActivaciones: summary.totalActivaciones,
      conteoPorGas: summary.conteoPorGas,
      listaAlarmas: listaAlarmasValue,
    },
    update: {
      totalActivaciones: summary.totalActivaciones,
      conteoPorGas: summary.conteoPorGas,
      listaAlarmas: listaAlarmasValue,
      generadoEn: new Date(),
    },
  });

  return summary;
}

export async function generateDailyGestionAlarmasSnapshot({
  referenceDate = new Date(),
  includeAlarmList = false,
  gasId,
  states,
}: {
  referenceDate?: Date;
  includeAlarmList?: boolean;
  gasId?: number;
  states?: string[];
} = {}) {
  const start = startOfDay(referenceDate);
  const end = endOfDay(referenceDate);
  const alarms = await listAlarms({ gasId, start, end, states });
  const snapshot = await createGestionAlarmasSnapshot({
    alarms,
    referenceDate: start,
    includeAlarmList,
  });

  return { date: start, snapshot };
}
