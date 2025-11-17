import { NavLink } from "react-router-dom";

const LINKS = [
  { to: "/live", label: "Monitoreo-live" },
  { to: "/registro", label: "Registro" },
];

export default function Navigator() {
  return (
    <nav style={{ display: "flex", gap: 12 }}>
      {LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          style={({ isActive }) => ({
            padding: "8px 14px",
            borderRadius: 999,
            background: isActive ? "rgba(148, 197, 253, 0.18)" : "transparent",
            color: isActive ? "#e2e8f0" : "#cbd5f5",
            textDecoration: "none",
            fontWeight: 500,
            transition: "background 0.2s ease"
          })}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
