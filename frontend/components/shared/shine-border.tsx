"use client";

import { cn } from "@/lib/utils";

type ShineBorderProps = {
  borderRadius?: number;
  borderWidth?: number;
  duration?: number;
  color?: string | string[];
  className?: string;
  children: React.ReactNode;
};

function ShineBorder({
  borderRadius = 16,
  borderWidth = 2,
  duration = 14,
  color = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  className,
  children,
}: ShineBorderProps) {
  const colors = Array.isArray(color) ? color.join(", ") : color;

  return (
    <div
      style={
        {
          "--border-radius": `${borderRadius}px`,
          "--border-width": `${borderWidth}px`,
          "--shine-pulse-duration": `${duration}s`,
          "--shine-colors": colors,
        } as React.CSSProperties
      }
      className={cn(
        "relative rounded-[--border-radius] p-[--border-width]",
        "before:absolute before:inset-0 before:rounded-[--border-radius]",
        "before:bg-[linear-gradient(var(--shine-angle,0deg),var(--shine-colors))]",
        "before:animate-[shine-pulse_var(--shine-pulse-duration)_infinite_linear]",
        "before:will-change-[background-position]",
        className,
      )}
    >
      <div
        className={cn(
          "relative z-[1] rounded-[calc(var(--border-radius)-var(--border-width))]",
          "bg-white dark:bg-slate-900",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export { ShineBorder };
