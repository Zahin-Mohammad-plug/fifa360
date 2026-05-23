"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
  strong?: boolean;
  glow?: boolean;
}

export function GlassCard({
  interactive,
  strong,
  glow,
  className,
  children,
  ...rest
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        strong ? "glass-strong" : "glass",
        "rounded-3xl",
        interactive && "card-hover cursor-pointer",
        glow && "shadow-glow-pitch",
        className,
      )}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
