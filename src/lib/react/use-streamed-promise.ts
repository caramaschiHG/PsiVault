import { use } from "react";

/**
 * Unwraps a Promise inside a Client Component render.
 * Must be called inside a Suspense boundary.
 * Throws on rejection — catch with ErrorBoundary.
 */
export function useStreamedPromise<T>(promise: Promise<T>): T {
  return use(promise);
}
