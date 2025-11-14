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
  return (
    <div style={{ display: "flex", justifyContent: "flex-start", width: "100%", paddingTop: "20px" }}>
      <button onClick={onDownloadLogs} style={{ marginLeft: 20 }}>
        Descargar registro
      </button>
      
      <div style={{ marginLeft: 20, marginBottom: 20 }}>
        <button onClick={isConnected ? onDisconnectArduino : onConnectArduino}>
          {isConnected ? "Desconectar Arduino" : "Conectar Arduino"}
        </button>

        <button style={{ marginLeft: 10 }} onClick={onResetSimulation}>
          Reiniciar
        </button>
      </div>
    </div>
  );
}