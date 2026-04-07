"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { SlotClickHandler } from "./calendar-grid";
import { QuickCreatePopover } from "./quick-create-popover";

interface QuickCreateWrapperProps {
  patients: Array<{ id: string; fullName: string; socialName?: string }>;
  defaultDurationMinutes: number;
  defaultCareMode: "IN_PERSON" | "ONLINE";
  onCreate: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
  /** The grid component rendered with onSlotClick injected */
  renderGrid: (onSlotClick: SlotClickHandler) => React.ReactNode;
}

export function QuickCreateWrapper({
  patients,
  defaultDurationMinutes,
  defaultCareMode,
  onCreate,
  renderGrid,
}: QuickCreateWrapperProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [popoverState, setPopoverState] = useState<{
    startsAt: string;
    position: { top: number; left: number };
  } | null>(null);

  const handleSlotClick = useCallback<SlotClickHandler>((slotStartsAt, position) => {
    setPopoverState({ startsAt: slotStartsAt, position });
  }, []);

  const handleClose = useCallback(() => {
    setPopoverState(null);
  }, []);

  const handleCreate = useCallback(
    async (formData: FormData) => {
      const result = await onCreate(formData);
      if (result.success) {
        startTransition(() => {
          router.refresh();
          handleClose();
        });
      }
      return result;
    },
    [onCreate, router, handleClose],
  );

  return (
    <>
      {renderGrid(handleSlotClick)}
      {popoverState && (
        <QuickCreatePopover
          patients={patients}
          defaultStartsAt={popoverState.startsAt}
          defaultDurationMinutes={defaultDurationMinutes}
          defaultCareMode={defaultCareMode}
          onCreate={handleCreate}
          fullFormHref="/appointments/new"
          onClose={handleClose}
          position={popoverState.position}
        />
      )}
    </>
  );
}
