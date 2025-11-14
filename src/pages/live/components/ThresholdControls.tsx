import type { FormEvent } from "react";

type ThresholdControlsProps = {
  threshold: number;
  pendingThreshold: number;
  onChange: (value: number) => void;
  onUpdate: () => void;
  className?: string;
};

export default function ThresholdControls({
  threshold,
  pendingThreshold,
  onChange,
  onUpdate,
  className,
}: ThresholdControlsProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (threshold !== pendingThreshold) {
      onUpdate();
    }
  };

  return (
    <section className={`threshold-section${className ? ` ${className}` : ""}`}>
      <p style={{ margin: "0 0 8px", color: "#cbd5f5", fontWeight: 500 }}>Valor máximo permitido</p>
      <form onSubmit={handleSubmit}>
        <input type="number" value={pendingThreshold} onChange={(e) => onChange(Number(e.target.value))} />
        <button type="submit" disabled={threshold === pendingThreshold}>
          Actualizar umbral
        </button>
      </form>
    </section>
  );
}
