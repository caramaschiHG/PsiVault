export type ChargeStatus = "pago" | "pendente" | "atrasado";

export interface SessionCharge {
  id: string;
  workspaceId: string;
  patientId: string;
  appointmentId: string | null;
  status: ChargeStatus;
  amountInCents: number | null;
  paymentMethod: string | null;
  paidAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  fullName: string;
  socialName: string | null;
}
