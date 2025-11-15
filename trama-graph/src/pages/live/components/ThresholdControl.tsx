import { useLiveStore } from "../store";

export default function ThresholdControl() {
  const threshold = useLiveStore((s) => s.threshold);
  const pendingThreshold = useLiveStore((s) => s.pendingThreshold);
  const setPendingThreshold = useLiveStore((s) => s.setPendingThreshold);
  const setThreshold = useLiveStore((s) => s.setThreshold);

  const handleUpdate = () => {
    setThreshold(pendingThreshold);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", marginLeft: 20 }}>
      <div style={{ paddingBlock: "20px", display: "flex", flexDirection: "column" }}>
        <label>Valor máximo permitido:</label>
        <div>
          <input
            style={{ maxWidth: "80px", padding: "10px", marginRight: 10 }}
            type="number"
            value={pendingThreshold}
            onChange={(e) => setPendingThreshold(Number(e.target.value))}
          />
          <button disabled={threshold === pendingThreshold} onClick={handleUpdate}>
            Actualizar umbral
          </button>
        </div>
      </div>
    </div>
  );
}