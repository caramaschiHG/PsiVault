"use client";

import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

interface BaseButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loadingLabel?: string;
  children: React.ReactNode;
  className?: string;
}

type ButtonAsButton = BaseButtonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & {
    as?: "button";
    href?: never;
    disabled?: boolean;
  };

type ButtonAsAnchor = BaseButtonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "disabled"> & {
    as: "a";
    href: string;
    disabled?: never;
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "btn-ghost",
  danger: "btn-danger",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "",
  sm: "btn-sm",
};

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "spin 0.6s linear infinite", flexShrink: 0 }}
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="22"
        strokeDashoffset="8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      loadingLabel,
      children,
      className = "",
      as = "button",
      disabled,
      ...rest
    },
    ref,
  ) {
    const isDisabled = disabled || isLoading;
    const classes = [variantClasses[variant], sizeClasses[size], className]
      .filter(Boolean)
      .join(" ");

    if (as === "a") {
      const anchorRest = rest as AnchorHTMLAttributes<HTMLAnchorElement>;
      return (
        <a
          ref={ref as React.ForwardedRef<HTMLAnchorElement>}
          href={anchorRest.href}
          className={classes}
          aria-busy={isLoading ? "true" : undefined}
          {...anchorRest}
        >
          {isLoading && <SpinnerIcon />}
          {isLoading && loadingLabel ? loadingLabel : children}
        </a>
      );
    }

    const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;

    return (
      <button
        ref={ref as React.ForwardedRef<HTMLButtonElement>}
        disabled={isDisabled}
        aria-busy={isLoading ? "true" : undefined}
        className={classes}
        {...buttonRest}
      >
        {isLoading && <SpinnerIcon />}
        {isLoading && loadingLabel ? loadingLabel : children}
      </button>
    );
  },
);
