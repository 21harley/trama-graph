import React from "react";

type ControlPanelProps = {
  onDownloadLogs: () => void;
  onConnectArduino: () => void;
  onDisconnectArduino: () => void;
  onResetSimulation: () => void;
  isConnected: boolean;
  showDownloadButton?: boolean;
};

export default function ControlPanel({
  onDownloadLogs,
  onConnectArduino,
  onDisconnectArduino,
  onResetSimulation,
  isConnected,
  showDownloadButton = false,
}: ControlPanelProps) {
  const buttonStyle: React.CSSProperties = {
    padding: "6px 12px",
    borderRadius: 4,
    border: "1px solid #333",
    cursor: "pointer",
    height: 32,
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        paddingTop: "4px",
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
          <div style={{ display: "flex", alignItems: "center", width: "100%", gap: 10, marginLeft: 20 }}>
            <button
            onClick={isConnected ? onDisconnectArduino : onConnectArduino}
            style={buttonStyle}
          >
            {isConnected ? "Desconectar Arduino" : "Conectar Arduino"}
            <div
            style={{
              width: 16,
              height: 16,
              borderRadius: "50%",
              backgroundColor: isConnected ? "#22c55e" : "#000000",
              border: "1px solid #333",
            }}
          />
          <div></div>
          </button>

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