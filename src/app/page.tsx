export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "2rem",
      }}
    >
      <section
        style={{
          width: "min(680px, 100%)",
          padding: "2rem",
          borderRadius: "24px",
          background: "rgba(255, 252, 247, 0.86)",
          border: "1px solid rgba(146, 64, 14, 0.12)",
          boxShadow: "0 24px 80px rgba(120, 53, 15, 0.12)",
        }}
      >
        <p
          style={{
            margin: 0,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontSize: "0.75rem",
            color: "#92400e",
          }}
        >
          PsiVault
        </p>
        <h1 style={{ marginBottom: "0.75rem", fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>
          Vault foundation ready for authentication and setup flows.
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: "#44403c" }}>
          This initial scaffold establishes the Next.js runtime, Prisma data model,
          and Wave 0 verification baseline for the secure professional vault.
        </p>
      </section>
    </main>
  );
}

