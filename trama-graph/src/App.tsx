import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./core/components/Layout.tsx";
import LoaderPage from "./pages/LoaderPage.tsx";
import LivePage from "./pages/live/index.tsx";
import LivePages from "./pages/LivePage.tsx";
import RegistroPage from "./pages/registro/index.tsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<LoaderPage />} />
          <Route path="/live" element={<LivePage />} />
          <Route path="/livePages" element={<LivePages/>} />
          <Route path="/registro" element={<RegistroPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}