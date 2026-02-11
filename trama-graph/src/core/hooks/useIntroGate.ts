import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type GateStatus = "checking" | "allowed" | "redirecting";

const INTRO_FLAG_STORAGE_KEY = "hasSeenLoader";

export function useIntroGate(): GateStatus {
  const navigate = useNavigate();
  const [status, setStatus] = useState<GateStatus>("checking");

  useEffect(() => {
    if (typeof window === "undefined") {
      setStatus("allowed");
      return;
    }

    try {
      const hasSeenIntro = window.localStorage.getItem(INTRO_FLAG_STORAGE_KEY) === "true";

      if (!hasSeenIntro) {
        setStatus("redirecting");
        navigate("/", { replace: true });
        return;
      }

      setStatus("allowed");
    } catch {
      setStatus("redirecting");
      navigate("/", { replace: true });
    }
  }, [navigate]);

  return status;
}

export function useIntroGateAllowed() {
  const status = useIntroGate();
  return {
    status,
    allowed: status === "allowed",
    checking: status === "checking",
  };
}

export const INTRO_GATE_STORAGE_KEY = INTRO_FLAG_STORAGE_KEY;
