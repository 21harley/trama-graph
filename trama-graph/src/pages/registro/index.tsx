import { useMemo, useState } from "react";

import ControlPanel from "./components/ControlPanel";
import RecordsTable from "./components/RecordsTable";
import type { GasOption, MeasurementRecord, OptionalFilterVisibility } from "./types";
import { useIntroGate } from "../../core/hooks/useIntroGate";

type FiltersState = {
  date: string;
  startTime: string;
  endTime: string;
  gasId: string;
  threshold: string;
  thresholdOperator: "gte" | "lte" | "eq";
  measurement: string;
  measurementOperator: "gte" | "lte";
};

const API_BASE_URL = "http://localhost:3000/api/v1";

const GAS_OPTIONS: GasOption[] = [
  { label: "Todos", value: "", id: 0 },
  { label: "Monóxido de Carbono (CO)", value: "1", id: 1 },
  { label: "Alcohol (AL)", value: "2", id: 2 },
  { label: "Hidrógeno (H2)", value: "3", id: 3 },
  { label: "Metano (CH4)", value: "4", id: 4 },
  { label: "Gas Licuado (LPG)", value: "5", id: 5 },
];

function formatDate(value: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toISOString();
}

function buildISODate(date: string, time: string, fallbackTime: string) {
  if (!date) {
    return undefined;
  }

  const timePortion = time || fallbackTime;
  const composed = `${date}T${timePortion}`;
  const iso = new Date(composed);
  if (Number.isNaN(iso.getTime())) {
    return undefined;
  }

  return iso.toISOString();
}

export default function RegistroPage() {
  const gateStatus = useIntroGate();

  if (gateStatus !== "allowed") {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#e2e8f0",
        }}
      >
        Cargando...
      </div>
    );
  }

  return <RegistroPageContent />;
}

function RegistroPageContent() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const [filters, setFilters] = useState<FiltersState>({
    date: today,
    startTime: "00:00",
    endTime: "23:59",
    gasId: "",
    threshold: "",
    thresholdOperator: "gte",
    measurement: "",
    measurementOperator: "gte",
  });
  const [optionalFilters, setOptionalFilters] = useState<OptionalFilterVisibility>({
    gas: false,
    threshold: false,
    measurement: false,
  });
  const [records, setRecords] = useState<MeasurementRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilterChange = (field: keyof FiltersState, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleConsult = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      const startISO = buildISODate(filters.date, filters.startTime, "00:00");
      const endISO = buildISODate(filters.date, filters.endTime, "23:59");

      if (startISO) {
        params.append("start", startISO);
      }

      if (endISO) {
        params.append("end", endISO);
      }

      if (optionalFilters.gas && filters.gasId) {
        params.append("gasId", filters.gasId);
      }

      const thresholdValue = filters.threshold.trim();
      if (optionalFilters.threshold && thresholdValue.length > 0) {
        params.append("threshold", thresholdValue);
        params.append("thresholdOperator", filters.thresholdOperator);
      }

      const measurementValue = filters.measurement.trim();
      if (optionalFilters.measurement && measurementValue.length > 0) {
        params.append("measurement", measurementValue);
        params.append("measurementOperator", filters.measurementOperator);
      }

      const response = await fetch(`${API_BASE_URL}/measurements?${params.toString()}`);
      if (!response.ok) {
        throw new Error("No se pudo obtener la información desde el servidor");
      }

      const payload = await response.json();
      const items = Array.isArray(payload?.data) ? payload.data : [];

      const mapped: MeasurementRecord[] = items.map((item: any) => ({
        id: item.id,
        idTipoGas: item.idTipoGas,
        valor: Number(item.valor ?? 0),
        umbral: Number(item.umbral ?? 0),
        fechaMedida: formatDate(item.fechaMedida),
        tipoDeGasNombre: item.tipoDeGas?.nombre ?? null,
      }));

      setRecords(mapped);
    } catch (err) {
      setError((err as Error).message);
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!records.length) {
      return;
    }

    const header = ["Fecha/Hora", "Gas", "Valor", "Umbral", "Superó umbral"];
    const rows = records.map((record) => [
      new Date(record.fechaMedida).toLocaleString(),
      record.tipoDeGasNombre ?? `Gas #${record.idTipoGas}`,
      record.valor.toFixed(3),
      record.umbral.toFixed(3),
      record.valor > record.umbral ? "Sí" : "No",
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((cell) => `"${cell.replaceAll("\"", "\"\"")}"`).join(";"))
      .join("\n");

    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `registros-${filters.date || "consulta"}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style>
        {`
          .registro-scroll-root,
          .registro-scroll-root * {
            scrollbar-width: thin;
            scrollbar-color: #38bdf8 rgba(15, 23, 42, 0.65);
          }

          .registro-scroll-root ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }

          .registro-scroll-root ::-webkit-scrollbar-track {
            background: linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.6));
            border-radius: 999px;
          }

          .registro-scroll-root ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, rgba(56, 189, 248, 0.85), rgba(99, 102, 241, 0.85));
            border-radius: 999px;
          }

          .registro-scroll-root ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, rgba(56, 189, 248, 1), rgba(99, 102, 241, 1));
          }
        `}
      </style>
      <div
        className="registro-scroll-root"
        style={{
          width: "100%",
          maxHeight: "90vh",
          display: "flex",
          justifyContent: "center",
          background: "linear-gradient(180deg, rgba(15,23,42,0.95), rgba(15,23,42,0.75))",
          padding: "0",
        }}
      >
        <div style={{ width: "95%", display: "flex", flexDirection: "column", gap: 8 }}>
          <ControlPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            optionalFilters={optionalFilters}
            onToggleOptionalFilter={(filter, enabled) =>
              setOptionalFilters((prev) => ({ ...prev, [filter]: enabled }))
            }
            onConsult={handleConsult}
            onExport={handleExport}
            gasOptions={GAS_OPTIONS}
            loading={loading}
            disableExport={!records.length}
          />

          {error ? (
            <div
              style={{
                padding: "8px 10px",
                borderRadius: 12,
                border: "1px solid rgba(252, 165, 165, 0.35)",
                background: "rgba(239, 68, 68, 0.12)",
                color: "#fecaca",
                maxWidth: 520,
              }}
            >
              {error}
            </div>
          ) : null}

          <RecordsTable data={records} loading={loading} />
        </div>
      </div>
    </>
  );
}
