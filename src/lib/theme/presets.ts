export const themePresets = ["harbor", "slate", "clay", "ink"] as const;

export type ThemePreset = (typeof themePresets)[number];

export const colorSchemes = ["light", "dark", "system"] as const;

export type ColorScheme = (typeof colorSchemes)[number];

export const colorSchemeStorageKey = "clientnest-color-scheme";

export const themePresetMeta: Record<
  ThemePreset,
  { label: string; paper: string; accent: string; note: string }
> = {
  harbor: {
    label: "Harbor",
    paper: "#e8e6df",
    accent: "#21554e",
    note: "Sage paper, oxidized pine",
  },
  slate: {
    label: "Slate",
    paper: "#e6e8eb",
    accent: "#1e3a5f",
    note: "Cool gray, ink navy",
  },
  clay: {
    label: "Clay",
    paper: "#ebe6de",
    accent: "#6b3f2a",
    note: "Warm stone, umber",
  },
  ink: {
    label: "Ink",
    paper: "#e9e8e4",
    accent: "#1b4332",
    note: "Neutral paper, forest",
  },
};

export function isThemePreset(value: string): value is ThemePreset {
  return (themePresets as readonly string[]).includes(value);
}

export function parseThemePreset(value: unknown): ThemePreset {
  if (typeof value !== "string") return "harbor";
  return isThemePreset(value) ? value : "harbor";
}

export function parseWorkspaceTheme(value: unknown): ThemePreset {
  if (!value || typeof value !== "object") return "harbor";
  const preset = "preset" in value ? value.preset : undefined;
  return parseThemePreset(typeof preset === "string" ? preset : undefined);
}

export function isColorScheme(value: string): value is ColorScheme {
  return (colorSchemes as readonly string[]).includes(value);
}
