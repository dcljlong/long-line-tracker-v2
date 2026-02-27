import React, { useEffect, useState } from "react";
import { UI } from "@/lib/ui";
import {
  getThemeMode,
  getThemePalette,
  onThemeChange,
  setThemeMode,
  setThemePalette,
  type ThemeMode,
  type ThemePalette,
} from "@/lib/theme";

export default function Settings() {
  const [mode, setMode] = useState<ThemeMode>(() => getThemeMode());
  const [palette, setPalette] = useState<ThemePalette>(() => getThemePalette());

  useEffect(() => {
    const off = onThemeChange(() => {
      setMode(getThemeMode());
      setPalette(getThemePalette());
    });
    return () => off();
  }, []);

  const ModeBtn = ({ v, label }: { v: ThemeMode; label: string }) => (
    <button
      type="button"
      onClick={() => setThemeMode(v)}
      className={`llt-px-md llt-py-sm rounded-lg text-sm font-medium border transition-colors ${
        mode === v
          ? "bg-amber-500/90 text-slate-950 border-amber-400/30"
          : "border-white/10 llt-text-strong hover:bg-slate-900/30"
      }`}
    >
      {label}
    </button>
  );

  const PaletteBtn = ({ v, label }: { v: ThemePalette; label: string }) => (
    <button
      type="button"
      onClick={() => setThemePalette(v)}
      className={`llt-px-md llt-py-sm rounded-lg text-sm font-medium border transition-colors ${
        palette === v
          ? "bg-amber-500/90 text-slate-950 border-amber-400/30"
          : "border-white/10 llt-text-strong hover:bg-slate-900/30"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className={`${UI.shell} min-h-[calc(100vh-64px)]`}>
      <div className="px-4 lg:px-6 py-6">
        <div className={`${UI.card} ${UI.cardPad}`}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="llt-h2 llt-text-strong">Settings</div>
              <div className={`llt-body-sm ${UI.textMuted}`}>Theme + appearance</div>
            </div>
            <div className={`llt-caption ${UI.textMuted}`}>
              Mode: <span className="llt-text-strong font-medium">{mode}</span> · Palette:{" "}
              <span className="llt-text-strong font-medium">{palette}</span>
            </div>
          </div>

          <div className="mt-6 grid gap-6">
            <div>
              <div className="llt-label llt-text-strong mb-2">Light / Dark</div>
              <div className="flex flex-wrap gap-2">
                <ModeBtn v="dark" label="Dark" />
                <ModeBtn v="light" label="Light" />
              </div>
            </div>

            <div>
              <div className="llt-label llt-text-strong mb-2">Theme palette</div>
              <div className="flex flex-wrap gap-2">
                <PaletteBtn v="slate" label="Slate" />
                <PaletteBtn v="forest" label="Forest" />
                <PaletteBtn v="ocean" label="Ocean" />
                <PaletteBtn v="ember" label="Ember" />
                <PaletteBtn v="ivory-gold" label="Ivory & Gold" />
                <PaletteBtn v="elite-gold" label="Elite Gold" />
              </div>
              <div className={`mt-2 text-xs ${UI.textMuted}`}>
                (Palette requires index.css to define [data-theme] tokens. Mode always works.)
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}



