import type { GasOption, OptionalFilterVisibility } from "../types";

type FiltersState = {
  date: string;
  startTime: string;
  endTime: string;
  gasId: string;
  threshold: string;
  thresholdOperator: string;
  measurement: string;
  measurementOperator: string;
};

type ControlPanelProps = {
  filters: FiltersState;
  onFilterChange: (field: keyof FiltersState, value: string) => void;
  optionalFilters: OptionalFilterVisibility;
  onToggleOptionalFilter: (filter: keyof OptionalFilterVisibility, enabled: boolean) => void;
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
  gap: 8,
  padding: "2px 24px 10px",
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
  padding: "2px 12px 10px",
};

const checkboxesRowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 16,
  alignItems: "center",
  padding: "2px 12px 12px",
};

const inputStyle: React.CSSProperties = {
  background: "rgba(6, 92, 190, 0.57)",
  color: "#ffffffff",
  border: "1px solid rgba(29, 46, 87, 0.93)",
  borderRadius: 12,
  padding: "8px 12px",
  height: 42,
  minWidth: 160,
  outline: "none",
  fontSize: 14,
  boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.05)",
};

const selectBaseStyle: React.CSSProperties = {
  ...inputStyle,
  color: "#ffffff",
  paddingRight: 40,
  backgroundImage:
    "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"8\" viewBox=\"0 0 12 8\" fill=\"none\"><path d=\"M1.41 0.589844L6 5.16984L10.59 0.589844L12 1.99984L6 7.99984L0 1.99984L1.41 0.589844Z\" fill=\"white\"/></svg>')",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "calc(100% - 14px) center",
  backgroundSize: "12px",
  appearance: "none",
  WebkitAppearance: "none",
  MozAppearance: "none",
};

const buttonPrimaryStyle: React.CSSProperties = {
  padding: "8px 16px",
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
  optionalFilters,
  onToggleOptionalFilter,
  onConsult,
  onExport,
  gasOptions,
  loading,
  disableExport,
}: ControlPanelProps) {
  return (
    <section className="registro-control-panel" style={panelStyle}>
      <style>
        {`
          .registro-control-panel input[type="date"]::-webkit-calendar-picker-indicator,
          .registro-control-panel input[type="time"]::-webkit-calendar-picker-indicator,
          .registro-control-panel input[type="number"]::-webkit-inner-spin-button,
          .registro-control-panel input[type="number"]::-webkit-outer-spin-button {
            filter: invert(1);
          }

          .registro-control-panel input[type="number"]::-moz-focus-inner {
            color: inherit;
          }
        `}
      </style>
      <header style={{ display: "flex", flexDirection: "column", gap: 4}}>
        <h2 style={{ margin: 0, color: "#e2e8f0", fontSize: 18, fontWeight: 600 }}>Consulta de registros</h2>
      </header>

      <div style={checkboxesRowStyle}>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#cbd5f5", fontSize: 15 }}>
          <input
            type="checkbox"
            checked={optionalFilters.gas}
            onChange={(event) => onToggleOptionalFilter("gas", event.target.checked)}
          />
          Filtro por tipo de gas
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#cbd5f5", fontSize: 15 }}>
          <input
            type="checkbox"
            checked={optionalFilters.threshold}
            onChange={(event) => onToggleOptionalFilter("threshold", event.target.checked)}
          />
          Filtro por umbral
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, color: "#cbd5f5", fontSize: 15 }}>
          <input
            type="checkbox"
            checked={optionalFilters.measurement}
            onChange={(event) => onToggleOptionalFilter("measurement", event.target.checked)}
          />
          Filtro por medición
        </label>
      </div>

      <div style={inputsRowStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6,height:"68px" }}>
          <label style={{ color: "#cbd5f5", fontSize: 14 }}>Fecha</label>
          <input
            type="date"
            value={filters.date}
            onChange={(event) => onFilterChange("date", event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6,height:"68px" }}>
          <label style={{ color: "#cbd5f5", fontSize: 14 }}>Hora inicio</label>
          <input
            type="time"
            value={filters.startTime}
            onChange={(event) => onFilterChange("startTime", event.target.value)}
            style={inputStyle}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6,height:"68px" }}>
          <label style={{ color: "#cbd5f5", fontSize: 14 }}>Hora fin</label>
          <input
            type="time"
            value={filters.endTime}
            onChange={(event) => onFilterChange("endTime", event.target.value)}
            style={inputStyle}
          />
        </div>

        {optionalFilters.gas ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 6,height:"68px" }}>
            <label style={{ color: "#cbd5f5", fontSize: 14 }}>Tipo de gas</label>
            <select
              value={filters.gasId}
              onChange={(event) => onFilterChange("gasId", event.target.value)}
              style={{ ...selectBaseStyle, minWidth: 180 }}
            >
              {gasOptions.map((option) => (
                <option key={option.value} value={option.value} style={{ color: "#0f172a" }}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {optionalFilters.threshold ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, height: "68px" }}>
              <label style={{ color: "#cbd5f5", fontSize: 14 }}>Umbral</label>
              <input
                type="number"
                inputMode="decimal"
                value={filters.threshold}
                onChange={(event) => onFilterChange("threshold", event.target.value)}
                style={{ ...inputStyle, minWidth: 160 }}
                placeholder="Ej. 500"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, height: "68px" }}>
              <label style={{ color: "#cbd5f5", fontSize: 14 }}>Comparación de umbral</label>
              <select
                value={filters.thresholdOperator}
                onChange={(event) => onFilterChange("thresholdOperator", event.target.value)}
                style={{ ...selectBaseStyle, minWidth: 160 }}
              >
                <option value="gte" style={{ color: "#0f172a" }}>
                  Mayor o igual (≥)
                </option>
                <option value="lte" style={{ color: "#0f172a" }}>
                  Menor o igual (≤)
                </option>
                <option value="eq" style={{ color: "#0f172a" }}>
                  Igual (=)
                </option>
              </select>
            </div>
          </>
        ) : null}
        {optionalFilters.measurement ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, height: "68px" }}>
              <label style={{ color: "#cbd5f5", fontSize: 14 }}>Medición</label>
              <input
                type="number"
                inputMode="decimal"
                value={filters.measurement}
                onChange={(event) => onFilterChange("measurement", event.target.value)}
                style={{ ...inputStyle, minWidth: 160 }}
                placeholder="Ej. 300"
              />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, height: "68px" }}>
              <label style={{ color: "#cbd5f5", fontSize: 14 }}>Comparación de medición</label>
              <select
                value={filters.measurementOperator}
                onChange={(event) => onFilterChange("measurementOperator", event.target.value)}
                style={{ ...selectBaseStyle, minWidth: 160 }}
              >
                <option value="gte" style={{ color: "#0f172a" }}>
                  Mayor o igual (≥)
                </option>
                <option value="lte" style={{ color: "#0f172a" }}>
                  Menor o igual (≤)
                </option>
              </select>
            </div>
          </>
        ) : null}
        <div style={{ display: "flex", flexDirection: "column", gap: 6,height:"68px",justifyContent:"end" }}>
                   <button
          type="button"
          onClick={onConsult}
          style={buttonPrimaryStyle}
          disabled={loading}
        >
          {loading ? "Consultando..." : "Consultar"}
        </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6,height:"68px",justifyContent:"end" }}>
        <button
          type="button"
          onClick={onExport}
          style={buttonSecondaryStyle}
          disabled={disableExport}
        >
          Exportar a Excel
        </button>
        </div>
      </div>
    </section>
  );
}
