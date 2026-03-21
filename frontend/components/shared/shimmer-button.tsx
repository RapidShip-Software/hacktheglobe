"use client";

import { cn } from "@/lib/utils";
import type { CSSProperties, ReactNode } from "react";

type ShimmerButtonProps = {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
};

function ShimmerButton({
  shimmerColor = "#ffffff",
  shimmerSize = "0.05em",
  borderRadius = "100px",
  shimmerDuration = "3s",
  background = "rgba(0, 0, 0, 1)",
  className,
  children,
  onClick,
  disabled = false,
}: ShimmerButtonProps) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      style={
        {
          "--spread": "90deg",
          "--shimmer-color": shimmerColor,
          "--radius": borderRadius,
          "--speed": shimmerDuration,
          "--cut": shimmerSize,
          "--bg": background,
        } as CSSProperties
      }
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap",
        "px-6 py-3 text-white",
        "[background:var(--bg)] [border-radius:var(--radius)]",
        "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className,
      )}
    >
      {/* spark container */}
      <div
        className={cn(
          "-z-30 blur-[2px]",
          "absolute inset-0 overflow-visible [container-type:size]",
        )}
      >
        <div className="absolute inset-0 h-[100cqh] animate-[shimmer-slide_var(--speed)_ease-in-out_infinite_alternate] [aspect-ratio:1] [border-radius:0] [mask:none]">
          <div className="animate-[spin-around_var(--speed)_ease-in-out_infinite] absolute -inset-full w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
        </div>
      </div>
      {children}

      {/* backdrop */}
      <div
        className={cn(
          "insert-0 absolute size-full",
          "rounded-2xl px-4 py-3 text-sm font-medium shadow-2xl",
          "backdrop-blur-sm",
          "[border:calc(var(--cut)_/_1.2)_solid_rgba(255,255,255,.12)]",
          "[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
          "[mask-composite:exclude]",
        )}
      />

      {/* highlight */}
      <span className="z-10 flex items-center gap-2 text-sm font-medium">
        {children}
      </span>
    </button>
  );
}

export { ShimmerButton };
