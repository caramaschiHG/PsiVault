"use client";

import { useRouter } from "next/navigation";
import { useKeyboardShortcuts } from "./agenda-keyboard";

interface AgendaKeyboardProps {
  currentView: "day" | "week" | "month";
  currentDate: string; // ISO date string
  monthStart?: string; // ISO date string for month view
  onClosePanel?: () => void;
}

export function AgendaKeyboard({ currentView, currentDate, monthStart, onClosePanel }: AgendaKeyboardProps) {
  const router = useRouter();

  const dayMs = 24 * 60 * 60 * 1000;
  const weekMs = 7 * dayMs;

  const navigate = (offset: number) => {
    const date = new Date(currentDate);
    const newDate = new Date(date.getTime() + offset);
    const dateStr = newDate.toISOString().slice(0, 10);
    router.push(`/agenda?view=${currentView}&date=${dateStr}`);
  };

  const goToday = () => {
    const today = new Date();
    const todayStr = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate())).toISOString().slice(0, 10);
    router.push(`/agenda?view=${currentView}&date=${todayStr}`);
  };

  const changeView = (view: "day" | "week" | "month") => {
    const dateStr = view === "month" && monthStart ? monthStart.slice(0, 10) : currentDate.slice(0, 10);
    router.push(`/agenda?view=${view}&date=${dateStr}`);
  };

  useKeyboardShortcuts({
    onPrev: () => {
      if (currentView === "day") navigate(-dayMs);
      else if (currentView === "week") navigate(-weekMs);
      else navigate(-30 * dayMs);
    },
    onNext: () => {
      if (currentView === "day") navigate(dayMs);
      else if (currentView === "week") navigate(weekMs);
      else navigate(30 * dayMs);
    },
    onToday: goToday,
    onViewChange: changeView,
    onClose: onClosePanel,
  });

  return null;
}
