import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoaderPage() {
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Comprobar en localStorage si ya se mostró esta pantalla antes
    const hasSeenLoader = window.localStorage.getItem("hasSeenLoader") === "true";

    if (hasSeenLoader) {
      navigate("/live", { replace: true });
      return;
    }

    const timeoutId = window.setTimeout(() => {
      console.log("Timeout reached");
      window.localStorage.setItem("hasSeenLoader", "true");
      navigate("/live");
      window.clearTimeout(timeoutId);
    }, 10000); // 60 segundos

  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <h1>Cargando aplicación...</h1>
    </div>
  );
}
