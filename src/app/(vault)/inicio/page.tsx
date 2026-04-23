/**
 * /inicio — Dashboard orchestrator with granular Suspense.
 */

import { resolveSession } from "@/lib/supabase/session";
import { QuickActionFab } from "./components/quick-action-fab";
import { UpdateNotification } from "../../components/update-notification";
import { AsyncBoundary } from "@/components/streaming/async-boundary";
import { PageHeaderSkeleton } from "@/components/streaming/page-header-skeleton";
import { SectionSkeleton } from "@/components/streaming/section-skeleton";
import TodaySection from "./sections/today-section";
import { RemindersSectionAsync } from "./components/reminders-section-async";
import SnapshotSection from "./sections/snapshot-section";
import PendingChargesSection from "./sections/pending-charges-section";

const shellStyle: React.CSSProperties = {
  padding: "var(--space-page-padding-y) var(--space-page-padding-x)",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "var(--space-6)",
  alignContent: "start",
};

function TodaySkeleton() {
  return (
    <>
      <PageHeaderSkeleton />
      <SectionSkeleton />
    </>
  );
}

export default async function InicioPage() {
  const { workspaceId } = await resolveSession();

  return (
    <main style={shellStyle}>
      <AsyncBoundary fallback={<TodaySkeleton />}>
        <TodaySection workspaceId={workspaceId} />
      </AsyncBoundary>

      <AsyncBoundary fallback={<SectionSkeleton />}>
        <RemindersSectionAsync workspaceId={workspaceId} />
      </AsyncBoundary>

      <AsyncBoundary fallback={<SectionSkeleton />}>
        <SnapshotSection workspaceId={workspaceId} />
      </AsyncBoundary>

      <AsyncBoundary fallback={<SectionSkeleton />}>
        <PendingChargesSection workspaceId={workspaceId} />
      </AsyncBoundary>

      <QuickActionFab />
      <UpdateNotification />
    </main>
  );
}
