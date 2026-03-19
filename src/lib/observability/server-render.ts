type ServerRenderMetadata = Record<string, unknown>;

interface ServerRenderErrorPayload {
  message: string;
  name: string;
  digest?: string;
  stack?: string;
}

function sanitizeMetadata(metadata?: ServerRenderMetadata) {
  if (!metadata) return undefined;

  return Object.fromEntries(
    Object.entries(metadata).filter(([, value]) => value !== undefined),
  );
}

function toErrorPayload(error: unknown): ServerRenderErrorPayload {
  if (error instanceof Error) {
    const digest =
      "digest" in error && typeof error.digest === "string"
        ? error.digest
        : undefined;

    return {
      message: error.message,
      name: error.name,
      digest,
      stack: error.stack,
    };
  }

  return {
    message: String(error),
    name: "UnknownError",
  };
}

export function logServerRenderInfo(
  route: string,
  stage: string,
  metadata?: ServerRenderMetadata,
) {
  console.info("[server-render]", {
    route,
    stage,
    ...sanitizeMetadata(metadata),
  });
}

export function logServerRenderError(
  route: string,
  stage: string,
  error: unknown,
  metadata?: ServerRenderMetadata,
) {
  console.error("[server-render]", {
    route,
    stage,
    error: toErrorPayload(error),
    ...sanitizeMetadata(metadata),
  });
}

export async function observeServerStage<T>(
  route: string,
  stage: string,
  run: () => Promise<T>,
  metadata?: ServerRenderMetadata,
): Promise<T> {
  logServerRenderInfo(route, `${stage}:start`, metadata);

  try {
    const result = await run();
    logServerRenderInfo(route, `${stage}:success`, metadata);
    return result;
  } catch (error) {
    logServerRenderError(route, `${stage}:error`, error, metadata);
    throw error;
  }
}
