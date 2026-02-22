export type ColorMode = "light" | "dark";
export type PaletteTheme = "default" | "forest" | "ocean" | "ember" | "slate";

const MODE_KEY = "llt:mode";
const PALETTE_KEY = "llt:theme";

export function getStoredMode(): ColorMode {
  const v = (localStorage.getItem(MODE_KEY) || "").toLowerCase();
  return v === "light" ? "light" : "dark";
}

export function getStoredPalette(): PaletteTheme {
  const v = (localStorage.getItem(PALETTE_KEY) || "").toLowerCase();
  if (v === "forest" || v === "ocean" || v === "ember" || v === "slate") return v;
  return "default";
}

export function applyMode(mode: ColorMode) {
  const root = document.documentElement;
  if (mode === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
  localStorage.setItem(MODE_KEY, mode);
}

export function applyPalette(palette: PaletteTheme) {
  document.documentElement.setAttribute("data-theme", palette);
  localStorage.setItem(PALETTE_KEY, palette);
}

export function initThemeFromStorage() {
  applyMode(getStoredMode());
  applyPalette(getStoredPalette());
}
