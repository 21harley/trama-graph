import AuthorCard from "./components/AuthorCard";

const AUTHORS = [
  {
    name: "John Harley Llanes Escobar",
    description: "Desarrolladora front-end enfocada en experiencias intuitivas.",
    avatarUrl:
      "https://media.licdn.com/dms/image/v2/D4E03AQGSHQ0pHPs__A/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1718228048052?e=1772668800&v=beta&t=cJe3uYPelUgxrT_0HW17Un8RGnbiJLOcBPFn473m7oA",
    linkedinUrl: "www.linkedin.com/in/john-llanes-dev",
    githubUrl: "https://github.com/21harley",
  },
{
    name: "Daniel Urbina",
    description: "Desarrolladora Full Stack",
    avatarUrl:"https://avatars.githubusercontent.com/u/76529067?v=4",
    linkedinUrl: "https://www.linkedin.com/in/danielurbina007",
    githubUrl: "https://github.com/DansPlaying",
  },
];

export default function AutoresPage() {
  return (
    <section
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 32,
        padding: "0px 12px",
        color: "#e2e8f0",
      }}
    >
      <header style={{ textAlign: "center", maxWidth: 760 }}>
        <h1 style={{ fontSize: 36, margin:2  }}>Autores</h1>
        <p style={{ fontSize: 16, color: "#cbd5f5" }}>
          Conoce a las personas detrás del sistema de monitoreo y visualización de gases.
        </p>
      </header>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 24,
          width: "100%",
          maxWidth: 820,
          justifyItems: "center",
        }}
      >
        {AUTHORS.map((author) => (
          <AuthorCard key={author.name} {...author} />
        ))}
      </div>
    </section>
  );
}
