export const SENSITIVE_ACTION_REAUTH_WINDOW_MS = 1000 * 60 * 10;

export interface SensitiveActionChallenge {
  id: string;
  actionId: string;
  title: string;
  reason: string;
  confirmationLabel: string;
  requiresReauth: true;
  issuedAt: Date;
}

interface CreateSensitiveActionChallengeDependencies {
  now: Date;
  createId?: () => string;
}

export interface SensitiveActionDecision {
  allowed: boolean;
  status: "approved" | "needs_confirmation" | "needs_reauth" | "expired";
  message: string;
}

function createOpaqueId() {
  const buffer = new Uint8Array(12);
  globalThis.crypto.getRandomValues(buffer);

  return Array.from(buffer, (value) => value.toString(16).padStart(2, "0")).join("");
}

function normalizeConfirmation(value: string) {
  return value.trim().toLocaleUpperCase("pt-BR");
}

export function createSensitiveActionChallenge(
  input: {
    actionId: string;
    title: string;
    reason: string;
    confirmationLabel?: string;
  },
  deps: CreateSensitiveActionChallengeDependencies,
): SensitiveActionChallenge {
  const createId = deps.createId ?? createOpaqueId;

  return {
    id: createId(),
    actionId: input.actionId,
    title: input.title,
    reason: input.reason,
    confirmationLabel: input.confirmationLabel ?? "CONFIRMAR",
    requiresReauth: true,
    issuedAt: deps.now,
  };
}

export function evaluateSensitiveAction(input: {
  challenge: SensitiveActionChallenge;
  confirmationValue: string;
  reauthVerifiedAt: Date | null;
  now: Date;
  maxAgeMs?: number;
}): SensitiveActionDecision {
  const maxAgeMs = input.maxAgeMs ?? SENSITIVE_ACTION_REAUTH_WINDOW_MS;

  if (input.now.getTime() - input.challenge.issuedAt.getTime() > maxAgeMs) {
    return {
      allowed: false,
      status: "expired",
      message: "Confirmação expirada. Reabra a ação para continuar com calma.",
    };
  }

  if (!input.reauthVerifiedAt || input.now.getTime() - input.reauthVerifiedAt.getTime() > maxAgeMs) {
    return {
      allowed: false,
      status: "needs_reauth",
      message: "Confirme novamente sua identidade antes de seguir.",
    };
  }

  if (normalizeConfirmation(input.confirmationValue) !== normalizeConfirmation(input.challenge.confirmationLabel)) {
    return {
      allowed: false,
      status: "needs_confirmation",
      message: `Digite “${input.challenge.confirmationLabel}” para concluir esta ação.`,
    };
  }

  return {
    allowed: true,
    status: "approved",
    message: "Confirmação reforçada concluída com sucesso.",
  };
}
