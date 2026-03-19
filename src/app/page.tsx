import type { Metadata } from "next";
import { LandingPage } from "./components/landing/landing-page";

export const metadata: Metadata = {
  title: "PsiVault | Rotina clínica com calma, sigilo e clareza",
  description:
    "PsiVault é um software para psicólogos brasileiros organizarem prontuário, agenda, documentos e acompanhamento da rotina clínica em um só lugar.",
};

export default function HomePage() {
  return <LandingPage />;
}
