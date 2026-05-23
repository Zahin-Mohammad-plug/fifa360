import { cn } from "@/lib/utils";
import type { Team } from "@/lib/types";

export function TeamCrest({
  team,
  size = "md",
  className,
}: {
  team: Team;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dims = {
    sm: { box: "h-10 w-10 text-2xl rounded-xl", label: "text-[11px]" },
    md: { box: "h-14 w-14 text-3xl rounded-2xl", label: "text-xs" },
    lg: { box: "h-20 w-20 text-5xl rounded-3xl", label: "text-sm" },
  }[size];
  return (
    <div className={cn("flex flex-col items-center gap-1.5", className)}>
      <div
        className={cn("grid place-items-center bg-white/5 backdrop-blur", dims.box)}
        style={{ boxShadow: `inset 0 0 0 2px ${team.primaryColor}55, 0 0 22px -6px ${team.primaryColor}` }}
      >
        <span className="leading-none drop-shadow">{team.flag}</span>
      </div>
      <span className={cn("font-semibold text-white/90", dims.label)}>{team.name}</span>
    </div>
  );
}
