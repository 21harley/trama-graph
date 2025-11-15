import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoaderPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Comprobar en localStorage si ya se mostró esta pantalla antes
    const hasSeenLoader = typeof window !== "undefined" &&
      window.localStorage.getItem("hasSeenLoader") === "true";

    if (hasSeenLoader) {
      navigate("/live", { replace: true });
      return;
    }

    // Marcar que ya se pasó por la pantalla de carga
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hasSeenLoader", "true");
    }

    const timeoutId = setTimeout(() => {
      navigate("/live");
    }, 30000); // 30 segundos

    return () => clearTimeout(timeoutId);
  }, [navigate]);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <h1>Cargando aplicación...</h1>
    </div>
  );
}
