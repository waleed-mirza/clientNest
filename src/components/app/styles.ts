export const inputClass =
  "h-10 w-full rounded-sm border border-border bg-surface-2 px-3 text-sm text-foreground placeholder:text-muted transition-[border-color,background-color] duration-150 hover:border-[color-mix(in_oklab,var(--foreground)_22%,transparent)] focus-visible:border-accent";

export const primaryButtonClass =
  "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm bg-accent px-4 text-sm font-medium text-accent-foreground transition-opacity duration-150 hover:opacity-90 active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:opacity-50 disabled:active:opacity-50";

export const secondaryButtonClass =
  "inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-sm border border-border bg-surface px-4 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-background active:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-surface disabled:active:bg-surface";

export const textButtonClass =
  "inline-flex cursor-pointer items-center gap-2 text-sm text-muted transition-colors duration-150 hover:text-foreground active:opacity-80 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:text-muted";

export const listClass = "divide-y divide-border bg-surface";

export const panelClass = "bg-surface p-5";

export const rowClass =
  "flex flex-wrap items-center justify-between gap-2 px-4 py-3 transition-colors duration-150 hover:bg-surface-2";
