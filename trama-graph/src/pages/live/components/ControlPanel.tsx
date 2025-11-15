import ActiveAlertsPanel from "./ActiveAlertsPanel";

interface ControlPanelProps {
  onDownloadLogs: () => void;
  onConnectArduino: () => void;
  onDisconnectArduino: () => void;
  onResetSimulation: () => void;
  isConnected: boolean;
}

export default function ControlPanel({
  onDownloadLogs,
  onConnectArduino,
  onDisconnectArduino,
  onResetSimulation,
  isConnected,
}: ControlPanelProps) {
  const buttonStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid #333",
    cursor: "pointer",
    height: 32,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        paddingTop: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: 20 }}>
          <button
            onClick={isConnected ? onDisconnectArduino : onConnectArduino}
            style={buttonStyle}
          >
            {isConnected ? "Desconectar Arduino" : "Conectar Arduino"}
          </button>

          <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: isConnected ? "#22c55e" : "#000000",
              border: "1px solid #333",
            }}
          />
        </div>

        <button
          onClick={onDownloadLogs}
          style={{ ...buttonStyle, marginRight: 20 }}
        >
          Descargar registro
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          marginTop: 10,
          marginLeft: 20,
          marginRight: 20,
          marginBottom: 10,
          minHeight: 32,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          {isConnected ? (
            <button onClick={onResetSimulation} style={buttonStyle}>
              Reiniciar
            </button>
          ) : (
            <button
              style={{
                ...buttonStyle,
                visibility: "hidden",
                pointerEvents: "none",
              }}
            >
              Reiniciar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}