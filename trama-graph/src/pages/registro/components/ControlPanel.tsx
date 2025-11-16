import type { GasOption } from "../types";

type FiltersState = {
  date: string;
  startTime: string;
  endTime: string;
  gasId: string;
};

type ControlPanelProps = {
  filters: FiltersState;
  onFilterChange: (field: keyof FiltersState, value: string) => void;
  onConsult: () => void;
  onExport: () => void;
  gasOptions: GasOption[];
  loading: boolean;
  disableExport: boolean;
};

const panelStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: 16,
  padding: "20px 24px",
  background: "rgba(15, 23, 42, 0.85)",
  borderRadius: 16,
  border: "1px solid rgba(148, 197, 253, 0.18)",
  boxShadow: "0 10px 40px rgba(14, 116, 144, 0.25)",
};

const inputsRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  alignItems: "center",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(15, 23, 42, 0.7)",
  color: "#e2e8f0",
  border: "1px solid rgba(148, 197, 253, 0.2)",
  borderRadius: 12,
  padding: "10px 14px",
  height: 42,
  minWidth: 160,
  outline: "none",
  fontSize: 14,
  boxShadow: "inset 0 0 0 1px rgba(148, 197, 253, 0.05)",
};

const buttonPrimaryStyle: React.CSSProperties = {
  padding: "12px 20px",
  borderRadius: 12,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
  background: "linear-gradient(135deg, #38bdf8, #2563eb)",
  color: "#0f172a",
  minWidth: 140,
  transition: "transform 0.15s ease, box-shadow 0.15s ease",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const buttonSecondaryStyle: React.CSSProperties = {
  ...buttonPrimaryStyle,
  background: "rgba(15, 23, 42, 0.7)",
  color: "#e2e8f0",
  border: "1px solid rgba(148, 197, 253, 0.25)",
};

export default function ControlPanel({
  filters,
  onFilterChange,
  onConsult,
  onExport,
  gasOptions,
  loading,
  disableExport,
}: ControlPanelProps) {
  return ( 
    <section style={panelStyle}>
      <header style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: 20, fontWeight: 600 }}>Consulta de registros</h2>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
          Define un rango de fecha y hora junto al tipo de gas para consultar las mediciones almacenadas.
        </p>
      </header>

      <div style={inputsRowStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ color: "#cbd5f5", fontSize: 12 }}>Fecha</label>
          <input
            type="date"
            value={filters.date}
            onChange={(event) => onFilterChange("date", event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ color: "#cbd5f5", fontSize: 12 }}>Hora inicio</label>
          <input
            type="time"
            value={filters.startTime}
            onChange={(event) => onFilterChange("startTime", event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ color: "#cbd5f5", fontSize: 12 }}>Hora fin</label>
          <input
            type="time"
            value={filters.endTime}
            onChange={(event) => onFilterChange("endTime", event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ color: "#cbd5f5", fontSize: 12 }}>Tipo de gas</label>
          <select
            value={filters.gasId}
            onChange={(event) => onFilterChange("gasId", event.target.value)}
            style={{ ...inputStyle, minWidth: 180 }}
          >
            {gasOptions.map((option) => (
              <option key={option.value} value={option.value} style={{ color: "#0f172a" }}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ ...inputsRowStyle, justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={onConsult}
          style={buttonPrimaryStyle}
          disabled={loading}
        >
          {loading ? "Consultando..." : "Consultar"}
        </button>

        <button
          type="button"
          onClick={onExport}
          style={buttonSecondaryStyle}
          disabled={disableExport}
        >
          Exportar a Excel
        </button>
      </div>
    </section>
  );
}
