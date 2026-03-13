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
      <body>{children}</body>
    </html>
  );
}

