"use client";

import { useEffect } from "react";
import { useNotifications } from "@/components/ui/notification-context";

const STORAGE_KEY = "psivault_darkmode_notif_v1";

export function DarkModeNotification() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const seen = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (!seen) {
      addNotification({
        type: "update",
        title: "Modo escuro disponível",
        description: "Você pode ativar o tema escuro em Configurações > Aparência. O modo escuro é mais confortável em ambientes com pouca luz.",
      });
      localStorage.setItem(STORAGE_KEY, "1");
    }
  }, [addNotification]);

  return null;
}
