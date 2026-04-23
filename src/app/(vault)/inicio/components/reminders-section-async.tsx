import { getReminderRepository } from "@/lib/reminders/store";
import { Section } from "@/components/ui/section";
import { RemindersSection } from "../components/reminders-section";

interface RemindersSectionAsyncProps {
  workspaceId: string;
}

export async function RemindersSectionAsync({ workspaceId }: RemindersSectionAsyncProps) {
  const repoPromise = getReminderRepository().listActive(workspaceId);
  const remindersPromise = repoPromise.then((reminders) =>
    reminders.map((r) => ({
      id: r.id,
      title: r.title,
      dueAt: r.dueAt ? r.dueAt.toISOString() : null,
    }))
  );
  return (
    <Section title="Lembretes ativos">
      <RemindersSection remindersPromise={remindersPromise} workspaceId={workspaceId} />
    </Section>
  );
}
