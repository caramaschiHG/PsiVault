/** @vitest-environment jsdom */
import React, { use } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AsyncBoundary } from "@/components/streaming/async-boundary";
import { SectionSkeleton } from "@/components/streaming/section-skeleton";
import { ChartSkeleton } from "@/components/streaming/chart-skeleton";
import { StatCardSkeleton } from "@/components/streaming/stat-card-skeleton";

let resolvePromise: (value: string) => void;
const deferredPromise = new Promise<string>((resolve) => {
  resolvePromise = resolve;
});

function MockAsyncSection() {
  const value = use(deferredPromise);
  return <div data-testid="async-section">{value}</div>;
}

function MockErrorSection(): React.ReactNode {
  throw new Error("Section failed");
}

describe("Streaming integration", () => {
  it("renders async section through AsyncBoundary with skeleton fallback", async () => {
    await act(async () => {
      render(
        <AsyncBoundary fallback={<div data-testid="section-skeleton">Skeleton</div>}>
          <MockAsyncSection />
        </AsyncBoundary>
      );
    });
    expect(screen.getByTestId("section-skeleton")).toBeInTheDocument();

    await act(async () => {
      resolvePromise("Section loaded");
    });

    expect(await screen.findByTestId("async-section")).toHaveTextContent("Section loaded");
  });

  it("renders ChartSkeleton with correct structure", () => {
    render(<ChartSkeleton height={120} barCount={6} />);
    const skeletons = document.querySelectorAll(".skeleton-shimmer");
    expect(skeletons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders StatCardSkeleton with label and value placeholders", () => {
    render(<StatCardSkeleton />);
    const skeletons = document.querySelectorAll(".skeleton-shimmer");
    expect(skeletons.length).toBeGreaterThanOrEqual(2);
  });

  it("catches section error with AsyncBoundary and shows retry", async () => {
    render(
      <AsyncBoundary fallback={<div>Loading</div>}>
        <MockErrorSection />
      </AsyncBoundary>
    );
    expect(await screen.findByText(/Erro ao carregar esta seção/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tentar novamente/i })).toBeInTheDocument();
  });

  it("all skeleton components have skeleton-shimmer class", () => {
    render(
      <>
        <SectionSkeleton />
        <StatCardSkeleton />
        <ChartSkeleton />
      </>
    );
    const shimmerElements = document.querySelectorAll(".skeleton-shimmer");
    expect(shimmerElements.length).toBeGreaterThanOrEqual(5);
  });
});
