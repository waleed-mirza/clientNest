"use client";

import { useEffect, useState } from "react";
import {
  colorSchemes,
  colorSchemeStorageKey,
  isColorScheme,
  type ColorScheme,
} from "@/lib/theme/presets";

const labels: Record<ColorScheme, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

function resolvedScheme(pref: ColorScheme): "light" | "dark" {
  if (pref === "dark") return "dark";
  if (pref === "light") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyScheme(pref: ColorScheme) {
  document.documentElement.dataset.schemePref = pref;
  document.documentElement.dataset.colorScheme = resolvedScheme(pref);
  localStorage.setItem(colorSchemeStorageKey, pref);
}

function readPref(): ColorScheme {
  if (typeof document === "undefined") return "light";
  const stored = document.documentElement.dataset.schemePref;
  return stored && isColorScheme(stored) ? stored : "light";
}

export function ColorSchemeToggle({ compact = false }: { compact?: boolean }) {
  const [pref, setPref] = useState<ColorScheme>(readPref);

  useEffect(() => {
    const sync = (value?: string) => {
      const next = value && isColorScheme(value) ? value : readPref();
      setPref(next);
    };
    const onScheme = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail;
      sync(detail);
    };
    sync();
    document.addEventListener("clientnest-scheme", onScheme);
    return () => document.removeEventListener("clientnest-scheme", onScheme);
  }, []);

  useEffect(() => {
    if (pref !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyScheme("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [pref]);

  return (
    <div
      role="group"
      aria-label="Color scheme"
      className={compact ? "flex gap-1" : "flex flex-wrap gap-1"}
      suppressHydrationWarning
    >
      {colorSchemes.map((scheme) => {
        const selected = pref === scheme;
        return (
          <button
            key={scheme}
            type="button"
            data-set-scheme={scheme}
            aria-pressed={selected}
            className={`rounded-sm px-2 py-1 text-xs transition-opacity duration-150 ${
              selected
                ? "bg-accent text-accent-foreground hover:opacity-90 active:opacity-80"
                : "text-muted hover:bg-background hover:text-foreground active:opacity-80"
            }`}
            onClick={() => {
              setPref(scheme);
              applyScheme(scheme);
            }}
          >
            {labels[scheme]}
          </button>
        );
      })}
    </div>
  );
}
