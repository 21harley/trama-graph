import { Outlet } from "react-router-dom";

import Footer from "./Footer.tsx";
import Header from "./Header.tsx";
import Navigator from "./Navigator.tsx";

export default function Layout() {
  return (
    <div className="app-shell">
      <Header title="Trama Graph">
        <Navigator />
      </Header>

      <main className="app-main">
        <Outlet />
      </main>

      <Footer>
        <span>Monitoreo ambiental en tiempo real</span>
      </Footer>
    </div>
  );
}
