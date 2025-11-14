import type { ReactNode } from "react";

type FooterProps = {
  children?: ReactNode;
};

export default function Footer({ children }: FooterProps) {
  return (
    <footer
      style={{
        marginTop: "auto",
        padding: "12px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: "0.875rem",
        color: "#94a3b8",
        borderTop: "1px solid rgba(148, 163, 184, 0.2)",
        background: "rgba(15, 23, 42, 0.85)",
      }}
    >
      <span>© {new Date().getFullYear()} Trama Graph</span>
      <div>{children}</div>
    </footer>
  );
}
