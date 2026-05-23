"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "accent" | "glass" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-pitch-400 to-emerald-600 text-white shadow-glow-pitch hover:brightness-110",
  accent:
    "bg-gradient-to-r from-trophy-300 to-trophy-500 text-black font-semibold shadow-glow-trophy hover:brightness-105",
  glass: "glass text-white hover:bg-white/15",
  ghost: "text-white/75 hover:bg-white/10",
  danger: "bg-gradient-to-r from-rose-500 to-red-600 text-white hover:brightness-110",
};
const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5 rounded-xl",
  md: "h-11 px-4 text-sm gap-2 rounded-2xl",
  lg: "h-14 px-6 text-base gap-2.5 rounded-2xl",
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

type ButtonProps = BaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseProps> & { href?: undefined };
type LinkProps = BaseProps & { href: string; onClick?: () => void };

export function Button(props: ButtonProps | LinkProps) {
  const {
    variant = "primary",
    size = "md",
    fullWidth,
    loading,
    leftIcon,
    rightIcon,
    className,
    children,
  } = props;

  const classes = cn(
    "focus-ring pressable inline-flex select-none items-center justify-center font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    fullWidth && "w-full",
    className,
  );

  const inner = (
    <>
      {loading ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      <span className="truncate">{children}</span>
      {!loading && rightIcon}
    </>
  );

  if ("href" in props && props.href !== undefined) {
    return (
      <Link href={props.href} onClick={props.onClick} className={classes}>
        {inner}
      </Link>
    );
  }

  const { onClick, disabled, type } = props as ButtonProps;
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type ?? "button"}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
    >
      {inner}
    </motion.button>
  );
}
