export const UI = {
  // Global shell/background. Must be token-driven (no hex, no slate).
  // Use background + subtle depth via gradients that still respect tokens.
  shell:
    "bg-background text-foreground " +
    "bg-gradient-to-b from-background via-background to-card",

  // Standard page wrapper (adjust header height if required)
  page: "min-h-[calc(100vh-56px)]",

  // Standard surface card
  card:
    "rounded-2xl bg-card text-card-foreground " +
    "ring-1 ring-border/60 shadow-[0_12px_35px_rgba(0,0,0,0.35)]",

  cardHover:
    "transition-colors hover:bg-card/95 hover:ring-border",

  cardPad: "p-4 md:p-6",

  // Lines / dividers inside cards
  divider: "border-border/60",

  // Typography
  textSubtle: "text-foreground/80",
  textMuted: "text-muted-foreground",
  textDisabled: "text-muted-foreground/70",

  // Controls
  input:
    "bg-background text-foreground placeholder:text-muted-foreground/70 " +
    "border-input focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-0",
} as const;
