export default function HomePage() {
  return (
    <main
      style={{
        minHeight: "100%",
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
          Um vault discreto para cuidar da rotina inteira do consultório.
        </h1>
        <p style={{ margin: 0, lineHeight: 1.6, color: "#44403c" }}>
          A fundação já separa identidade profissional, workspace proprietário,
          sessão persistente e o hub protegido de preparação do ambiente.
        </p>
        <div style={{ display: "flex", gap: "0.9rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
          <a
            href="/sign-up"
            style={{
              borderRadius: "999px",
              padding: "0.9rem 1.2rem",
              background: "#9a3412",
              color: "#fff",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Criar conta
          </a>
          <a
            href="/sign-in"
            style={{
              borderRadius: "999px",
              padding: "0.9rem 1.2rem",
              border: "1px solid rgba(146, 64, 14, 0.16)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Entrar e seguir para o setup
          </a>
        </div>
      </section>
    </main>
  );
}
