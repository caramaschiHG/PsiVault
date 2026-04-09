"use client";

/**
 * Breadcrumb — hierarchical navigation trail.
 *
 * Usage:
 *   <Breadcrumb>
 *     <BreadcrumbItem href="/patients">Pacientes</BreadcrumbItem>
 *     <BreadcrumbItem href="/patients/123">João Silva</BreadcrumbItem>
 *     <BreadcrumbItem>Documentos</BreadcrumbItem>
 *   </Breadcrumb>
 */

import Link from "next/link";
import type { ReactNode } from "react";

interface BreadcrumbProps {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}

export function Breadcrumb({
  children,
  className = "",
  "aria-label": ariaLabel = "Breadcrumb",
}: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} className={`breadcrumb ${className}`}>
      {children}
    </nav>
  );
}

interface BreadcrumbItemProps {
  href?: string;
  children: ReactNode;
  className?: string;
}

export function BreadcrumbItem({ href, children, className = "" }: BreadcrumbItemProps) {
  return (
    <span className={`breadcrumb-item ${className}`}>
      {href ? (
        <Link href={href} className="breadcrumb-link">
          {children}
        </Link>
      ) : (
        <span className="breadcrumb-current" aria-current="page">
          {children}
        </span>
      )}
    </span>
  );
}

export function BreadcrumbSeparator({ className = "" }: { className?: string }) {
  return <span className={`breadcrumb-sep ${className}`} aria-hidden="true">›</span>;
}
