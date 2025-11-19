import type { MeasurementRecord } from "../types";

type RecordsTableProps = {
  data: MeasurementRecord[];
  loading: boolean;
};

const tableContainerStyle: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
  background: "rgba(15, 23, 42, 0.75)",
  borderRadius: 16,
  border: "1px solid rgba(148, 197, 253, 0.15)",
  boxShadow: "0 20px 40px rgba(14, 116, 144, 0.18)",
  overflowY: "auto",
  maxHeight:"380px",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  color: "#e2e8f0",
  maxHeight:"280px",
  overflowY: "auto",
};

const headerCellStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid rgba(148, 197, 253, 0.12)",
  background: "rgba(59, 130, 246, 0.12)",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: 0.8,
};

const cellStyle: React.CSSProperties = {
  padding: "14px 18px",
  borderBottom: "1px solid rgba(148, 197, 253, 0.08)",
  fontSize: 15,
};

const emptyStateStyle: React.CSSProperties = {
  padding: "24px",
  textAlign: "center",
  color: "#94a3b8",
};

export default function RecordsTable({ data, loading }: RecordsTableProps) {
  if (loading) {
    return (
      <div style={tableContainerStyle}>
        <div style={emptyStateStyle}>Consultando registros...</div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div style={tableContainerStyle}>
        <div style={emptyStateStyle}>No se encontraron registros para los filtros seleccionados.</div>
      </div>
    );
  }

  return (
    <div style={tableContainerStyle}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={headerCellStyle}>Fecha / Hora</th>
            <th style={headerCellStyle}>Gas</th>
            <th style={headerCellStyle}>Valor</th>
            <th style={headerCellStyle}>Umbral</th>
            <th style={headerCellStyle}>Superó umbral</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record) => {
            const exceededThreshold = record.valor > record.umbral;
            return (
              <tr key={record.id}>
                <td style={cellStyle}>{new Date(record.fechaMedida).toLocaleString()}</td>
                <td style={cellStyle}>{record.tipoDeGasNombre ?? `Gas #${record.idTipoGas}`}</td>
                <td style={cellStyle}>{record.valor.toFixed(3)}</td>
                <td style={cellStyle}>{record.umbral.toFixed(3)}</td>
                <td style={{ ...cellStyle, color: exceededThreshold ? "#22c55e" : "#f97316" }}>
                  {exceededThreshold ? "Sí" : "No"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
