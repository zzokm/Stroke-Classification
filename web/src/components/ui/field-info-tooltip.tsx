"use client";

import { Info } from "lucide-react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { FieldHelp } from "@/lib/field-help";
import { cn } from "@/lib/utils";

interface FieldInfoTooltipProps {
  help: FieldHelp;
  className?: string;
}

export function FieldInfoTooltip({ help, className }: FieldInfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const tooltipId = useId();

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = 288;
    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));
    setCoords({ top: rect.bottom + 8, left });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    const onLayout = () => updatePosition();
    window.addEventListener("scroll", onLayout, true);
    window.addEventListener("resize", onLayout);
    return () => {
      window.removeEventListener("scroll", onLayout, true);
      window.removeEventListener("resize", onLayout);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`More information about ${help.label}`}
        aria-expanded={open}
        aria-controls={open ? tooltipId : undefined}
        className={cn(
          "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((value) => !value)}
      >
        <Info className="size-3.5" strokeWidth={2} aria-hidden />
      </button>
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id={tooltipId}
            role="tooltip"
            className="pointer-events-none fixed z-50 w-72 rounded-lg border border-border bg-popover px-3 py-2.5 text-popover-foreground shadow-md"
            style={{ top: coords.top, left: coords.left }}
          >
            <p className="text-sm leading-relaxed text-foreground">
              {help.description}
            </p>
            {help.validRange && (
              <p className="mt-2 text-xs font-medium text-muted-foreground">
                Valid values: {help.validRange}
              </p>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
