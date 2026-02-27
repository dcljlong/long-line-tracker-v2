export const UI = {
  // Shell background (premium gradient using tokens)
  shell: "llt-shell",

  // Standard page wrapper (header is 64px in LLT)
  page: "min-h-[calc(100vh-64px)]",

  // Premium glass card
  card: "llt-card rounded-2xl",

  cardHover: "llt-card-hover",

  cardPad: "p-4 md:p-6",

  // Lines / dividers inside cards
  divider: "border-border/70",

  // Typography
  textSubtle: "text-foreground/85",
  textMuted: "text-muted-foreground",
  textDisabled: "text-muted-foreground/60",

  // Controls
  input:
    "bg-background/55 text-foreground placeholder:text-muted-foreground " +
    "border border-input/80 rounded-lg " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 focus-visible:border-ring/35 " +
    "disabled:opacity-60 disabled:cursor-not-allowed",

  // Buttons
  btnPrimary:
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold " +
    "llt-btn-gold text-primary-foreground " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/45 transition",

  btnSecondary:
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold " +
    "bg-secondary text-secondary-foreground hover:bg-secondary/85 " +
    "border border-border/70 " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35 transition",

  btnGhost:
    "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium " +
    "hover:bg-accent/70 hover:text-accent-foreground transition",

  // Pills / active nav
  pillActive: "bg-primary/14 text-primary ring-1 ring-primary/18",
  pillIdle: "text-muted-foreground hover:text-foreground hover:bg-accent/60",

  // Small badge
  badge: "bg-secondary/90 text-secondary-foreground border border-border/70",
} as const;

