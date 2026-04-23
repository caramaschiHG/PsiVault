/** @vitest-environment jsdom */
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { Suspense } from "react";
import { useStreamedPromise } from "@/lib/react/use-streamed-promise";

function TestComponent({ promise }: { promise: Promise<string> }) {
  const value = useStreamedPromise(promise);
  return <span>{value}</span>;
}

function Wrapper({ promise }: { promise: Promise<string> }) {
  return (
    <Suspense fallback={<div data-testid="fallback">Loading</div>}>
      <TestComponent promise={promise} />
    </Suspense>
  );
}

describe("useStreamedPromise", () => {
  it("resolves and renders value", async () => {
    await act(async () => {
      render(<Wrapper promise={Promise.resolve("hello")} />);
    });
    expect(screen.getByText("hello")).toBeInTheDocument();
  });
});
