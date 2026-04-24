"use client";

import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, forwardRef } from "react";
import { Spinner } from "./spinner";

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
          {isLoading && <Spinner size="sm" aria-hidden="true" />}
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
        {isLoading && <Spinner size="sm" aria-hidden="true" />}
        {isLoading && loadingLabel ? loadingLabel : children}
      </button>
    );
  },
);
