export const REDACTED_VALUE = "[redacted]";

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /patient/i,
  /note/i,
  /diagn/i,
  /symptom/i,
  /phone/i,
  /email/i,
  /cpf/i,
  /rg/i,
  /pix/i,
  /ip(address)?/i,
];

function shouldRedactKey(key: string) {
  return SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
}

export function redactForLogs(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redactForLogs(item));
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        shouldRedactKey(key) ? REDACTED_VALUE : redactForLogs(entry),
      ]),
    );
  }

  return value;
}
