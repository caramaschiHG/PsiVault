"use client";

import { useEffect } from "react";
import { onLCP, onINP, onCLS, onTTFB, onFCP } from "web-vitals";
import type { Metric } from "web-vitals";

interface CwvPayload {
  metricName: string;
  value: number;
  rating: string;
  pagePath: string;
}

const buffer: CwvPayload[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

function flush() {
  if (buffer.length === 0) return;
  const batch = buffer.splice(0, buffer.length);
  const body = JSON.stringify(batch);

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/metrics", body);
  } else {
    fetch("/api/metrics", {
      method: "POST",
      body,
      keepalive: true,
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});
  }
}

function queueMetric(metric: Metric) {
  buffer.push({
    metricName: metric.name,
    value: metric.value,
    rating: metric.rating,
    pagePath: window.location.pathname,
  });

  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flush, 5000);

  if (buffer.length >= 5) flush();
}

export function CwvCollector() {
  useEffect(() => {
    onLCP(queueMetric);
    onINP(queueMetric);
    onCLS(queueMetric);
    onTTFB(queueMetric);
    onFCP(queueMetric);

    const handleBeforeUnload = () => flush();
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (flushTimeout) clearTimeout(flushTimeout);
      flush();
    };
  }, []);

  return null;
}
