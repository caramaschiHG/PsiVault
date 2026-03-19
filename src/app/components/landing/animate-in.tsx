"use client";

import { useEffect, useRef } from "react";
import styles from "./animate-in.module.css";

interface AnimateInProps {
  children: React.ReactNode;
  delay?: string;
  className?: string;
}

export function AnimateIn({ children, delay, className }: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add(styles.visible);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add(styles.visible);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={[styles.animateIn, className].filter(Boolean).join(" ")}
      style={delay ? { transitionDelay: delay } : undefined}
    >
      {children}
    </div>
  );
}
