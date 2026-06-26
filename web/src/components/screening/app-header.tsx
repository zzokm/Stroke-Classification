"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/", label: "Screening" },
  { href: "/model-details", label: "Model details" },
] as const;

interface AppHeaderProps {
  wide?: boolean;
}

export function AppHeader({ wide = false }: AppHeaderProps) {
  const pathname = usePathname();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    const syncHeight = () => {
      document.documentElement.style.setProperty(
        "--app-header-height",
        `${header.offsetHeight}px`,
      );
    };

    syncHeight();
    const observer = new ResizeObserver(syncHeight);
    observer.observe(header);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty("--app-header-height");
    };
  }, []);

  return (
    <header
      ref={headerRef}
      data-app-header
      className="sticky top-0 z-50 isolate border-b border-border/70 bg-background/75 backdrop-blur-md backdrop-saturate-150 no-print"
    >
      <div
        className={cn(
          "mx-auto flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
          wide ? "max-w-6xl" : "max-w-3xl",
        )}
      >
        <div className="min-w-0">
          <p className="text-balance text-xl font-semibold leading-tight text-foreground">
            Stroke Risk Screening
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Preventive assessment from routine health records
          </p>
        </div>

        <nav aria-label="Primary" className="flex shrink-0 gap-2">
          {NAV.map(({ href, label }) => {
            const active =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex min-h-9 items-center justify-center rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                  active
                    ? "bg-accent-light font-semibold text-brand"
                    : "text-muted-foreground hover:bg-accent-light hover:text-brand",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
