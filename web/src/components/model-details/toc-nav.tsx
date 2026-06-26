"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { MODEL_SECTIONS, type ModelSectionId } from "@/lib/model-report";

function getHeaderOffset(): number {
  const header = document.querySelector<HTMLElement>("[data-app-header]");
  return (header?.offsetHeight ?? 84) + 20;
}

interface TocNavProps {
  activeId: ModelSectionId;
  onJump: (id: ModelSectionId) => void;
  className?: string;
}

export function TocNav({ activeId, onJump, className }: TocNavProps) {
  const activeSection = MODEL_SECTIONS.find((s) => s.id === activeId);

  return (
    <nav aria-label="Page sections" className={className}>
      <p className="mb-1 text-sm font-semibold text-foreground">On this page</p>
      {activeSection && (
        <p className="mb-3 text-xs leading-snug text-brand-dark" aria-live="polite">
          {activeSection.label}
        </p>
      )}
      <ul className="space-y-0.5">
        {MODEL_SECTIONS.map((section) => {
          const isActive = activeId === section.id;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() => onJump(section.id)}
                aria-current={isActive ? "location" : undefined}
                className={cn(
                  "w-full rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150",
                  isActive
                    ? "bg-accent-light font-semibold text-brand-dark"
                    : "text-muted-foreground hover:bg-accent-light/70 hover:text-foreground",
                )}
              >
                {section.label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

interface MobileJumpMenuProps {
  activeId: ModelSectionId;
  onJump: (id: ModelSectionId) => void;
}

export function MobileJumpMenu({ activeId, onJump }: MobileJumpMenuProps) {
  return (
    <label className="flex flex-col gap-1.5 lg:hidden">
      <span className="text-sm font-medium text-foreground">
        On this page —{" "}
        <span className="text-brand-dark">
          {MODEL_SECTIONS.find((s) => s.id === activeId)?.label}
        </span>
      </span>
      <select
        value={activeId}
        onChange={(e) => onJump(e.target.value as ModelSectionId)}
        className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground"
      >
        {MODEL_SECTIONS.map((section) => (
          <option key={section.id} value={section.id}>
            {section.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function useScrollSpy(sectionIds: ModelSectionId[]) {
  const [activeId, setActiveId] = useState<ModelSectionId>(sectionIds[0]);

  useEffect(() => {
    const update = () => {
      const offset = getHeaderOffset();
      let current = sectionIds[0];

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= offset) {
          current = id;
        }
      }

      setActiveId(current);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sectionIds]);

  return activeId;
}

export function scrollToSection(id: ModelSectionId) {
  const el = document.getElementById(id);
  if (!el) return;

  const top =
    el.getBoundingClientRect().top + window.scrollY - getHeaderOffset();
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
}
