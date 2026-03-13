import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PsiVault",
  description: "Vault foundation for Brazilian psychologists.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "grid",
            gridTemplateRows: "auto 1fr",
          }}
        >
          <header
            style={{
              padding: "1.25rem 1.5rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong style={{ fontSize: "1.05rem" }}>PsiVault</strong>
              <p style={{ margin: "0.2rem 0 0", color: "#57534e", fontSize: "0.95rem" }}>
                Base segura para o consultório digital.
              </p>
            </div>
            <nav style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <a href="/sign-up">Criar conta</a>
              <a href="/sign-in">Entrar</a>
              <a href="/vault/setup">Setup hub</a>
            </nav>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
