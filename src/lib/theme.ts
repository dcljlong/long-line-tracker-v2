export type ThemeMode = "light" | "dark";
export type ThemePalette = "slate" | "forest" | "ocean" | "ember" | "elite-gold" | "ivory-gold";

const KEY_MODE = "llt-theme";
const KEY_PALETTE = "llt-palette";
const EVT = "llt-theme-change";

function systemPrefersDark(): boolean {
  try {
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  } catch {
    return false;
  }
}

export function getThemeMode(): ThemeMode {
  const v = (localStorage.getItem(KEY_MODE) || "").toLowerCase();
  if (v === "dark" || v === "light") return v;
  return systemPrefersDark() ? "dark" : "light";
}

export function getThemePalette(): ThemePalette {
  const v = (localStorage.getItem(KEY_PALETTE) || "").toLowerCase();
  if (v === "slate" || v === "forest" || v === "ocean" || v === "ember" || v === "elite-gold" || v === "ivory-gold") return v as ThemePalette;
  return "slate";
}

export function applyTheme(mode: ThemeMode, palette: ThemePalette) {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.dataset.theme = palette;
}

export function setThemeMode(mode: ThemeMode) {
  localStorage.setItem(KEY_MODE, mode);
  applyTheme(mode, getThemePalette());
  window.dispatchEvent(new CustomEvent(EVT));
}

export function setThemePalette(palette: ThemePalette) {
  localStorage.setItem(KEY_PALETTE, palette);
  applyTheme(getThemeMode(), palette);
  window.dispatchEvent(new CustomEvent(EVT));
}

export function initThemeFromStorage() {
  applyTheme(getThemeMode(), getThemePalette());
}

export function onThemeChange(handler: () => void) {
  const fn = () => handler();
  window.addEventListener(EVT, fn as EventListener);
  return () => window.removeEventListener(EVT, fn as EventListener);
}



