"use client";

/**
 * PatientFinanceiroTab — "Financeiro" tab content.
 * Shows: charge history and inline edit form.
 */

import type { SessionCharge } from "@/lib/finance/model";
import { FinanceSection } from "./finance-section";

interface PatientFinanceiroTabProps {
  charges: SessionCharge[];
  patientId: string;
  updateChargeAction: any;
}

export function PatientFinanceiroTab({
  charges,
  patientId,
  updateChargeAction,
}: PatientFinanceiroTabProps) {
  return (
    <FinanceSection
      charges={charges}
      patientId={patientId}
      updateChargeAction={updateChargeAction}
    />
  );
}
