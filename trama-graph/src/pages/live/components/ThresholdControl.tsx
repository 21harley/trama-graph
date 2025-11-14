interface ThresholdControlProps {
  pendingThreshold: number;
  setPendingThreshold: (value: number) => void;
  threshold: number;
  onUpdateThreshold: () => void;
}

export default function ThresholdControl({
  pendingThreshold,
  setPendingThreshold,
  threshold,
  onUpdateThreshold,
}: ThresholdControlProps) {
  return (
    <div style={{ display: "flex flex-col", marginLeft: 20 }}>
      <div style={{ paddingBlock: "20px", display: "flex", flexDirection: "column" }}>
        <label>Valor máximo permitido:</label>
        <div>
          <input
            style={{ maxWidth: "80px", padding: "10px", marginRight: 10 }}
            type="number"
            value={pendingThreshold}
            onChange={(e) => setPendingThreshold(Number(e.target.value))}
          />
          <button disabled={threshold === pendingThreshold} onClick={onUpdateThreshold}>
            Actualizar umbral
          </button>
        </div>
      </div>
    </div>
  );
}