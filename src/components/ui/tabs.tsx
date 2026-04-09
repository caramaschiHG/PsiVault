"use client";

/**
 * Tabs — accessible tab navigation with URL sync.
 *
 * Usage:
 *   <Tabs defaultValue="geral" searchParamKey="tab">
 *     <TabList>
 *       <Tab value="geral">Visão Geral</Tab>
 *       <Tab value="clinico">Clínico</Tab>
 *     </TabList>
 *     <TabPanels>
 *       <TabPanel value="geral">...</TabPanel>
 *       <TabPanel value="clinico">...</TabPanel>
 *     </TabPanels>
 *   </Tabs>
 */

import { Children, createContext, useContext, useEffect, useRef, useState, type ReactElement, type ReactNode } from "react";

// ─── Context ──────────────────────────────────────────────────────────────────

interface TabsCtx {
  value: string;
  setValue: (v: string) => void;
  listRef: React.RefObject<HTMLDivElement | null>;
  els: React.MutableRefObject<Map<string, HTMLButtonElement>>;
}

const Ctx = createContext<TabsCtx | null>(null);
const useCtx = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("Tabs: must be used within <Tabs>");
  return c;
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

export function Tabs({ defaultValue, searchParamKey, children, className = "" }: {
  defaultValue: string;
  searchParamKey?: string;
  children: ReactNode;
  className?: string;
}) {
  const [value, setRaw] = useState(() => {
    if (typeof window === "undefined" || !searchParamKey) return defaultValue;
    const p = new URLSearchParams(window.location.search);
    return p.get(searchParamKey) ?? defaultValue;
  });

  const listRef = useRef<HTMLDivElement>(null);
  const els = useRef(new Map<string, HTMLButtonElement>());

  // Sync from URL on back/forward
  useEffect(() => {
    if (!searchParamKey || typeof window === "undefined") return;
    const onPop = () => { const p = new URLSearchParams(window.location.search); const t = p.get(searchParamKey); if (t) setRaw(t); };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [searchParamKey]);

  const setValue = (v: string) => {
    setRaw(v);
    if (searchParamKey && typeof window !== "undefined") {
      const u = new URL(window.location.href);
      u.searchParams.set(searchParamKey, v);
      window.history.replaceState({}, "", u.toString());
    }
  };

  // Keyboard: ArrowLeft/Right, Home, End
  const onKeyDown = (e: React.KeyboardEvent) => {
    const ids = Array.from(els.current.keys());
    const i = ids.indexOf(value);
    if (i < 0) return;
    let n = i;
    if (e.key === "ArrowRight") { e.preventDefault(); n = (i + 1) % ids.length; }
    else if (e.key === "ArrowLeft") { e.preventDefault(); n = (i - 1 + ids.length) % ids.length; }
    else if (e.key === "Home") { e.preventDefault(); n = 0; }
    else if (e.key === "End") { e.preventDefault(); n = ids.length - 1; }
    else return;
    const el = els.current.get(ids[n]);
    el?.focus();
    el?.click();
  };

  return (
    <Ctx.Provider value={{ value, setValue, listRef: listRef as React.RefObject<HTMLDivElement>, els }}>
      <div className={className}>
        <div ref={listRef} role="tablist" className="tabs-list" onKeyDown={onKeyDown}>
          {Children.map(children, (child) => {
            if (!child) return null;
            const el = child as ReactElement;
            // @ts-expect-error
            if (el.type?._tl) return child;
            return null;
          })}
        </div>
        <div className="tabs-panels">
          {Children.map(children, (child) => {
            if (!child) return null;
            const el = child as ReactElement;
            // @ts-expect-error
            if (el.type?._tp) return child;
            return null;
          })}
        </div>
      </div>
    </Ctx.Provider>
  );
}

// ─── TabList ──────────────────────────────────────────────────────────────────
export function TabList({ children }: { children: ReactNode }) { return <>{children}</>; }
(TabList as any)._tl = true;

// ─── Tab ──────────────────────────────────────────────────────────────────────
export function Tab({ value, children, className = "" }: { value: string; children: ReactNode; className?: string }) {
  const { value: sel, setValue, els } = useCtx();
  const ref = useRef<HTMLButtonElement>(null);
  const active = sel === value;
  useEffect(() => { if (ref.current) els.current.set(value, ref.current); return () => { els.current.delete(value); }; }, [value, els]);
  return (
    <button ref={ref} role="tab" id={`tab-${value}`} aria-selected={active} aria-controls={`panel-${value}`} tabIndex={active ? 0 : -1} className={`tab ${active ? "tab--active" : ""} ${className}`} onClick={() => setValue(value)}>
      {children}
    </button>
  );
}

// ─── TabPanels ────────────────────────────────────────────────────────────────
export function TabPanels({ children }: { children: ReactNode }) { return <>{children}</>; }
(TabPanels as any)._tp = true;

// ─── TabPanel ─────────────────────────────────────────────────────────────────
export function TabPanel({ value, children, className = "" }: { value: string; children: ReactNode; className?: string }) {
  const { value: sel } = useCtx();
  if (sel !== value) return null;
  return (
    <div role="tabpanel" id={`panel-${value}`} aria-labelledby={`tab-${value}`} tabIndex={0} className={`tab-panel ${className}`}>
      {children}
    </div>
  );
}
