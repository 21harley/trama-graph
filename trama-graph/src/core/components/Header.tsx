import type { ReactNode } from "react";

type HeaderProps = {
  title: string;
  children?: ReactNode;
};

export default function Header({ title, children }: HeaderProps) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        background: "linear-gradient(90deg, #202533, #19202b)",
        color: "#f1f5f9",
      }}
    >
      <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 600 }}>{title}</h1>
      <div>{children}</div>
    </header>
  );
}
