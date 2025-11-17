import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import imagen1 from "../assets/imagen1.png";
import imagen2 from "../assets/imagen2.png";

const LOADER_DURATION_MS = 8_000;
const IMAGE_STAGE_DURATION_MS = 8_000;

type LoaderStage = "loading" | "image1" | "image2";

export default function LoaderPage() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<LoaderStage>("loading");

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

    const loaderTimeoutId = window.setTimeout(() => {
      setStage("image1");
    }, LOADER_DURATION_MS);

    const imageSwitchId = window.setTimeout(() => {
      setStage("image2");
    }, LOADER_DURATION_MS + IMAGE_STAGE_DURATION_MS);

    const redirectId = window.setTimeout(() => {
      window.localStorage.setItem("hasSeenLoader", "true");
      navigate("/live");
    }, LOADER_DURATION_MS + IMAGE_STAGE_DURATION_MS * 2);

    return () => {
      window.clearTimeout(loaderTimeoutId);
      window.clearTimeout(imageSwitchId);
      window.clearTimeout(redirectId);
    };
  }, [navigate]);

  const activeImage = stage === "image1" ? "image1" : stage === "image2" ? "image2" : null;
  const showLoaderOverlay = stage === "loading";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#0f172a",
        zIndex: 9999,
      }}
    >
      <img
        src={imagen1}
        alt="Intro paso 1"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 800ms ease",
          opacity: activeImage === "image1" ? 1 : 0,
        }}
      />
      <img
        src={imagen2}
        alt="Intro paso 2"
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center 40%",
          transition: "opacity 800ms ease",
          opacity: activeImage === "image2" ? 1 : 0,
        }}
      />
      {showLoaderOverlay ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15, 23, 42, 0.92)",
            color: "#e2e8f0",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              border: "6px solid rgba(148, 163, 184, 0.3)",
              borderTopColor: "#60a5fa",
              animation: "spin 1.2s linear infinite",
            }}
          />
          <span style={{ fontSize: 18, letterSpacing: 1 }}>Preparando experiencia...</span>
        </div>
      ) : null}
      <style>
        {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
      </style>
    </div>
  );
}
