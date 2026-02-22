import React, { useEffect, useMemo, useState } from "react";
import { UI } from "@/lib/ui";
import {
  applyMode,
  applyPalette,
  getStoredMode,
  getStoredPalette,
  type ColorMode,
  type PaletteTheme,
} from "@/lib/theme";

const PALETTES: { id: PaletteTheme; label: string }[] = [
  { id: "default", label: "Default" },
  { id: "forest", label: "Forest (Green)" },
  { id: "ocean", label: "Ocean (Blue)" },
  { id: "ember", label: "Ember (Amber)" },
  { id: "slate", label: "Slate (Neutral)" },
];

export default function Settings() {
  const [mode, setMode] = useState<ColorMode>("dark");
  const [palette, setPalette] = useState<PaletteTheme>("default");

  useEffect(() => {
    setMode(getStoredMode());
    setPalette(getStoredPalette());
  }, []);

  const onMode = (m: ColorMode) => {
    setMode(m);
    applyMode(m);
  };

  const onPalette = (p: PaletteTheme) => {
    setPalette(p);
    applyPalette(p);
  };

  const preview = useMemo(() => {
    return (
      <div className={`${UI.card} ${UI.cardPad} space-y-3`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Preview</div>
            <div className={`text-xs ${UI.textMuted}`}>Primary, accent, and sidebar brand tokens</div>
          </div>
          <span className="inline-flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span className="text-muted-foreground">primary</span>
          </span>
        </div>

        <div className="flex gap-2">
          <button type="button" className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold">
            Primary Action
          </button>
          <button type="button" className="px-3 py-2 rounded-lg bg-accent text-accent-foreground text-xs font-semibold">
            Accent
          </button>
          <button type="button" className="px-3 py-2 rounded-lg border border-input text-xs font-semibold">
            Outline
          </button>
        </div>
      </div>
    );
  }, []);

  return (
    <div className={`min-h-[calc(100vh-56px)] p-4 md:p-6 ${UI.shell}`}>
      <div className="max-w-3xl mx-auto space-y-4">
        <div className={`${UI.card} ${UI.cardPad}`}>
          <div className="text-lg font-semibold">Settings</div>
          <div className={`text-sm mt-1 ${UI.textMuted}`}>
            Theme mode and colour palette are stored locally per browser.
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className={`${UI.card} ${UI.cardPad} space-y-3`}>
            <div>
              <div className="text-sm font-semibold">Mode</div>
              <div className={`text-xs ${UI.textMuted}`}>Light/Dark</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onMode("dark")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  mode === "dark" ? "bg-accent text-accent-foreground" : "border border-input text-muted-foreground hover:text-foreground"
                }`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => onMode("light")}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                  mode === "light" ? "bg-accent text-accent-foreground" : "border border-input text-muted-foreground hover:text-foreground"
                }`}
              >
                Light
              </button>
            </div>
          </div>

          <div className={`${UI.card} ${UI.cardPad} space-y-3`}>
            <div>
              <div className="text-sm font-semibold">Palette</div>
              <div className={`text-xs ${UI.textMuted}`}>Primary / ring / sidebar brand</div>
            </div>

            <select
              className={`w-full px-3 py-2.5 rounded-lg text-sm border ${UI.input}`}
              value={palette}
              onChange={(e) => onPalette(e.target.value as PaletteTheme)}
            >
              {PALETTES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {preview}
      </div>
    </div>
  );
}
