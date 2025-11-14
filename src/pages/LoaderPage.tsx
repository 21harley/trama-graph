import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function LoaderPage() {
const navigate = useNavigate();
  useEffect(() => {
    setTimeout(() => {
      navigate("/live");
    }, 2000);
  }, []);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <h1>Cargando aplicación...</h1>
    </div>
  );
}
