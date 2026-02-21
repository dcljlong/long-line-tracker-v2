export const UI = {
  // Shell background (LLD-style ink gradient)
  shell:
    "text-white bg-gradient-to-b from-[#050A12] via-[#0B1626] to-[#071A2E]",

  // Standard page wrapper (adjust header height if required)
  page: "min-h-[calc(100vh-56px)]",

  // Glass card (LLD-style)
  card:
    "rounded-2xl bg-slate-800/50 backdrop-blur-md " +
    "ring-1 ring-white/5 shadow-[0_12px_35px_rgba(0,0,0,0.35)]",

  cardHover:
    "transition-colors hover:bg-slate-800/60 hover:ring-white/10",

  cardPad: "p-4 md:p-6",

  // Lines / dividers inside cards
  divider: "border-white/10",

  // Typography
  textSubtle: "text-slate-300",
  textMuted: "text-slate-400",
  textDisabled: "text-slate-500",

  // Controls (for className overrides where needed)
  input:
    "bg-slate-900/40 text-white placeholder:text-slate-500 " +
    "border-white/10 focus-visible:ring-2 focus-visible:ring-amber-500/40 focus-visible:ring-offset-0",
} as const;
