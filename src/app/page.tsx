export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingPage } from "./components/landing/landing-page";

export const metadata: Metadata = {
  title: "PsiVault | Rotina clínica com calma, sigilo e clareza",
  description:
    "PsiVault é um software para psicólogos brasileiros organizarem prontuário, agenda, documentos e acompanhamento da rotina clínica em um só lugar.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/inicio");

  return <LandingPage />;
}
