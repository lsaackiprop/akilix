export const primary = "#2563EB";
export const secondary = "#16A34A";
export const accent = "#F59E0B";
export const danger = "#EF4444";
export const warning = "#F59E0B";
export const success = "#16A34A";

export const theme = {
  colors: {
    primary,
    secondary,
    accent,
    danger,
    warning,
    success,
  },
  surface: {
    background: "#FFFFFF",
    foreground: "#0F172A",
    muted: "#F8FAFC",
    border: "#E2E8F0",
  },
  gradients: {
    brand: "from-blue-600 via-blue-500 to-green-600",
    cta: "from-blue-600 via-blue-600 to-green-600",
    success: "from-green-500 to-emerald-700",
    primary: "from-blue-500 to-blue-700",
    warning: "from-amber-500 to-orange-600",
    danger: "from-rose-500 to-red-700",
  },
  radius: {
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(15 23 42 / 0.04), 0 1px 1px -1px rgb(15 23 42 / 0.04)",
    md: "0 10px 15px -3px rgb(15 23 42 / 0.05), 0 4px 6px -4px rgb(15 23 42 / 0.05)",
    lg: "0 20px 25px -5px rgb(15 23 42 / 0.08), 0 8px 10px -6px rgb(15 23 42 / 0.06)",
  },
  font: {
    sans: "'Inter', ui-sans-serif, system-ui, sans-serif",
    display: "'DM Serif Display', ui-serif, Georgia, serif",
  },
} as const;

export type ThemeColorKey = keyof typeof theme.colors;
export type ThemeGradientKey = keyof typeof theme.gradients;
