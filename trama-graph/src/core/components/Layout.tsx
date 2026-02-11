import { type ReactNode, useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Footer from "./Footer.tsx";
import Header from "./Header.tsx";
import Navigator from "./Navigator.tsx";
import { useIntroGate } from "../hooks/useIntroGate";

type ViewportShellProps = {
  children: ReactNode;
};

function ViewportShell({ children }: ViewportShellProps) {
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateSize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    updateSize();
    window.addEventListener("resize", updateSize);

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const baseStyle = {
    overflowX: "hidden" as const,
    maxWidth: "100vw",
  };

  const dynamicStyle =
    viewportSize.width > 0 && viewportSize.height > 0
      ? {
          width: `${Math.min(viewportSize.width, 1440)}px`,
          minHeight: `${viewportSize.height}px`,
        }
      : undefined;

  return (
    <div className="app-shell" style={{ ...baseStyle, ...dynamicStyle }}>
      {children}
    </div>
  );
}

export default function Layout() {
  const gateStatus = useIntroGate();
  const showNavigation = gateStatus === "allowed";

  return (
    <ViewportShell>
      <Header title="Trama Graph">
        {showNavigation ? <Navigator /> : null}
      </Header>

      <main className="app-main">
        <Outlet />
      </main>

      <Footer>
        <span>
          SISTEMA DE DETECCIÓN AUTOMÁTICA DE GAS LICUADO DE PETROLEO (GLP) PARA LA
          PREVENCIÓN DE FUGAS EN ENTORNOS DOMÉSTICOS, COMERCIALES E INDUSTRIALES.
        </span>
      </Footer>
    </ViewportShell>
  );
}
