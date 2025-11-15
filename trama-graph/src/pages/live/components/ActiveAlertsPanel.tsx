import type { ActiveAlert } from "../types";
import { gasColors } from "./GasChart";
import { useLiveStore } from "../store";

export default function ActiveAlertsPanel() {
  const activeAlerts = useLiveStore((s) => s.activeAlerts as ActiveAlert[]);

  if (!activeAlerts.length) return null;

  return (
    <div
      style={{
        marginTop: 24,
        borderRadius: 8,
      }}
    >
      <h3
        style={{
          marginBottom: 12,
          fontSize: "1.1rem",
          fontWeight: 600,
          display:"lineal-block"
        }}
      >
        ⚠️
      </h3>
      <div
        style={{
          display: "flex",
          gap: "5px",
        }}
      >
        {activeAlerts.map((a, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "row",
              gap: "8px",
              padding: "8px 12px",
              backgroundColor: `${gasColors[a.gas]}15`,
              borderRadius: 6,
              border: `1px solid ${gasColors[a.gas]}30`,
              width: "100%",
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                backgroundColor: gasColors[a.gas],
              }}
            ></div>
            <span
              style={{
                color: gasColors[a.gas],
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              <strong>{a.gas}</strong>: {a.value.toFixed(0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
