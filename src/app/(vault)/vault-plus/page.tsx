import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vault+ | PsiVault",
};

export default function VaultPlusPage() {
  return (
    <main style={shellStyle}>
      <header style={headerStyle}>
        <p style={eyebrowStyle}>Pesquisa e Literatura</p>
        <h1 style={titleStyle}>Assistente de Pesquisa Psicanalítica</h1>
        <p style={copyStyle}>
          Uma ferramenta de apoio teórico integrada ao cofre. Desenvolvida para
          auxiliar o psicólogo clínico na articulação de conceitos, bibliografias e 
          pesquisa acadêmica, respeitando rigorosamente os limites da prática ética e 
          dos direitos autorais.
        </p>
      </header>

      <div style={gridStyle}>
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>O que o assistente faz</h2>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <strong style={itemTitleStyle}>Articulação teórica:</strong>
              <p style={itemCopyStyle}>Auxilia no cruzamento de conceitos fundamentais da psicanálise com base na linha configurada no seu perfil.</p>
            </li>
            <li style={listItemStyle}>
              <strong style={itemTitleStyle}>Pesquisa bibliográfica:</strong>
              <p style={itemCopyStyle}>Gera bibliografias comentadas e sugere leituras estruturadas por linha teórica e tema.</p>
            </li>
            <li style={listItemStyle}>
              <strong style={itemTitleStyle}>Busca e referência:</strong>
              <p style={itemCopyStyle}>Localiza citações, passagens e textos em obras de domínio público (como a obra completa de Freud).</p>
            </li>
          </ul>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Limites e o que NÃO faz</h2>
          <ul style={listStyle}>
            <li style={listItemStyle}>
              <strong style={itemTitleStyle}>Diagnóstico clínico:</strong>
              <p style={itemCopyStyle}>O assistente não analisa material de pacientes, não processa casos clínicos e não sugere diagnósticos.</p>
            </li>
            <li style={listItemStyle}>
              <strong style={itemTitleStyle}>Acesso ilegal a obras:</strong>
              <p style={itemCopyStyle}>Não distribui textos protegidos por copyright. Fornece metadados, resumos autorizados e caminhos legais para acesso.</p>
            </li>
            <li style={listItemStyle}>
              <strong style={itemTitleStyle}>Substituição da escuta:</strong>
              <p style={itemCopyStyle}>Funciona exclusivamente como indexador e articulador literário, preservando o trabalho analítico no território humano.</p>
            </li>
          </ul>
        </section>
      </div>
      
      <section style={footerCardStyle}>
        <div style={footerContentStyle}>
          <h3 style={footerTitleStyle}>Disponibilidade</h3>
          <p style={footerCopyStyle}>
            O Assistente de Pesquisa encontra-se em desenvolvimento conceitual.
            A configuração da sua linha teórica e pensador de preferência já está disponível no seu perfil profissional.
          </p>
          <a href="/settings/profile" style={buttonStyle}>Ajustar preferências teóricas</a>
        </div>
      </section>
    </main>
  );
}

const shellStyle = {
  padding: "2rem 2.5rem",
  display: "flex",
  flexDirection: "column",
  gap: "2rem",
  maxWidth: "1080px",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  maxWidth: "68ch",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  fontSize: "var(--font-size-label)",
  color: "var(--color-accent)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "var(--font-size-page-title)",
  fontFamily: "var(--font-serif)",
  fontWeight: 400,
  lineHeight: 1.1,
} satisfies React.CSSProperties;

const copyStyle = {
  margin: "0.5rem 0 0 0",
  fontSize: "1.05rem",
  lineHeight: 1.6,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const cardStyle = {
  padding: "2rem",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-2)",
  border: "1px solid var(--color-border-med)",
  boxShadow: "0 22px 64px rgba(120, 53, 15, 0.05)",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
} satisfies React.CSSProperties;

const sectionTitleStyle = {
  margin: 0,
  fontSize: "1.3rem",
  fontWeight: 600,
} satisfies React.CSSProperties;

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
} satisfies React.CSSProperties;

const listItemStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
} satisfies React.CSSProperties;

const itemTitleStyle = {
  fontSize: "1.05rem",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const itemCopyStyle = {
  margin: 0,
  fontSize: "0.95rem",
  lineHeight: 1.5,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const footerCardStyle = {
  padding: "2rem",
  borderRadius: "var(--radius-xl)",
  background: "linear-gradient(145deg, rgba(255, 251, 245, 0.98), rgba(251, 241, 224, 0.96))",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginTop: "1rem",
} satisfies React.CSSProperties;

const footerContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  maxWidth: "55ch",
  alignItems: "flex-start",
} satisfies React.CSSProperties;

const footerTitleStyle = {
  margin: 0,
  fontSize: "1.1rem",
  color: "#92400e",
} satisfies React.CSSProperties;

const footerCopyStyle = {
  margin: 0,
  fontSize: "0.95rem",
  lineHeight: 1.6,
  color: "var(--color-text-2)",
} satisfies React.CSSProperties;

const buttonStyle = {
  marginTop: "0.5rem",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.85rem 1.25rem",
  borderRadius: "var(--radius-md)",
  background: "var(--color-accent)",
  color: "#fff",
  textDecoration: "none",
  fontWeight: 600,
  fontSize: "0.95rem",
  transition: "background 0.2s",
} satisfies React.CSSProperties;
