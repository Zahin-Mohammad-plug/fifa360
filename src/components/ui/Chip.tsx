"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function Chip({ active, onClick, children, icon, className }: ChipProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.94 }}
      onClick={onClick}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 py-2 text-xs font-medium transition-all duration-200",
        active
          ? "border-pitch-300/60 bg-pitch-400/20 text-pitch-100 shadow-glow-pitch"
          : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white",
        className,
      )}
    >
      {icon}
      {children}
    </motion.button>
  );
}
