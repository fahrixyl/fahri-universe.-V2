export const THEMES = {
  cyan: { label: "Cyan", cyan: "34 211 238", electric: "37 99 235", a: [0.07, 0.18, 0.66], b: [0.0, 0.5, 0.62] },
  ungu: { label: "Ungu", cyan: "192 132 252", electric: "124 58 237", a: [0.3, 0.12, 0.62], b: [0.55, 0.2, 0.7] },
  hijau: { label: "Hijau", cyan: "52 211 153", electric: "5 150 105", a: [0.04, 0.38, 0.3], b: [0.1, 0.6, 0.35] },
  oranye: { label: "Oranye", cyan: "251 146 60", electric: "234 88 12", a: [0.55, 0.2, 0.08], b: [0.7, 0.4, 0.1] },
  pink: { label: "Pink", cyan: "244 114 182", electric: "219 39 119", a: [0.55, 0.1, 0.35], b: [0.7, 0.2, 0.5] },
} as const;
export type ThemeId = keyof typeof THEMES;
export const THEME_IDS = Object.keys(THEMES) as ThemeId[];

export function applyTheme(id: string) {
  const t = THEMES[(id as ThemeId) in THEMES ? (id as ThemeId) : "cyan"];
  const r = document.documentElement.style;
  r.setProperty("--cyan", t.cyan); r.setProperty("--electric", t.electric);
  window.dispatchEvent(new CustomEvent("fahri:theme", { detail: id }));
}
