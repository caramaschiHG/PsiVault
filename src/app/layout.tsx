import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "PsiVault",
    template: "%s",
  },
  description:
    "PsiVault organiza prontuário, agenda, documentos e acompanhamento para psicólogos brasileiros com uma experiência calma, séria e confiável.",
  openGraph: {
    title: "PsiVault",
    description:
      "Um lugar seguro, claro e organizado para a rotina clínica de psicólogos brasileiros.",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PsiVault",
    description:
      "Organize prontuário, agenda, documentos e acompanhamento com calma, sigilo e clareza.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
