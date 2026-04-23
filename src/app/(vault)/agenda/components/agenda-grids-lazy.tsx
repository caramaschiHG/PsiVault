"use client";

import dynamic from "next/dynamic";

export const MiniCalendar = dynamic(
  () => import("./mini-calendar").then((m) => m.MiniCalendar),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "280px",
          background: "var(--color-surface-1)",
          borderRadius: "var(--radius-lg)",
        }}
      />
    ),
  },
);

export const CalendarGrid = dynamic(
  () => import("./calendar-grid").then((m) => m.CalendarGrid),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "400px",
          background: "var(--color-surface-1)",
          borderRadius: "var(--radius-lg)",
        }}
      />
    ),
  },
);

export const WeekCalendarGrid = dynamic(
  () => import("./week-calendar-grid").then((m) => m.WeekCalendarGrid),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "400px",
          background: "var(--color-surface-1)",
          borderRadius: "var(--radius-lg)",
        }}
      />
    ),
  },
);
