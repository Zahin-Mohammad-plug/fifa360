"use client";

import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function PageHeading({
  title,
  subtitle,
  back,
  right,
}: {
  title: string;
  subtitle?: string;
  back?: boolean;
  right?: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 flex items-center gap-3"
    >
      {back && (
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="focus-ring pressable grid h-10 w-10 shrink-0 place-items-center rounded-full glass"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="truncate text-sm text-white/55">{subtitle}</p>}
      </div>
      {right}
    </motion.div>
  );
}
