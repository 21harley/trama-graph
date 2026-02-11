import type { CSSProperties } from "react";

type AuthorCardProps = {
  name: string;
  description: string;
  avatarUrl: string;
  linkedinUrl: string;
  githubUrl: string;
};

const CARD_STYLE: CSSProperties = {
  background: "rgba(15, 23, 42, 0.6)",
  border: "1px solid rgba(148, 197, 253, 0.2)",
  borderRadius: 16,
  padding: "24px 28px",
  width: "100%",
  maxWidth: 360,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 16,
  boxShadow: "0 20px 45px rgba(15, 23, 42, 0.35)",
  backdropFilter: "blur(6px)",
};

const BUTTON_STYLE: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "8px 16px",
  borderRadius: 999,
  border: "1px solid rgba(148, 197, 253, 0.35)",
  color: "#e2e8f0",
  textDecoration: "none",
  fontWeight: 500,
  transition: "background 0.2s ease, transform 0.2s ease",
};

export default function AuthorCard({
  name,
  description,
  avatarUrl,
  linkedinUrl,
  githubUrl,
}: AuthorCardProps) {
  return (
    <article style={CARD_STYLE}>
      <img
        src={avatarUrl}
        alt={`Avatar de ${name}`}
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          objectFit: "cover",
          border: "3px solid rgba(148, 197, 253, 0.5)",
        }}
      />
      <div style={{ textAlign: "center" }}>
        <h3 style={{ fontSize: 22, margin: 2, color: "#f1f5f9" }}>{name}</h3>
        <p style={{ fontSize: 15, color: "#cbd5f5", lineHeight: 1.5 }}>{description}</p>
      </div>
      <div style={{ display: "flex", gap: 12 }}>
        <a
          href={linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={BUTTON_STYLE}
        >
          LinkedIn
        </a>
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...BUTTON_STYLE, background: "rgba(148, 197, 253, 0.15)" }}
        >
          GitHub
        </a>
      </div>
    </article>
  );
}
