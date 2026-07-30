export const COLORS = {
  brand: {
    primary: "#2563EB",
    secondary: "#16A34A",
    accent: "#F59E0B",
  },
  semantic: {
    success: "#16A34A",
    warning: "#F59E0B",
    info: "#2563EB",
    danger: "#EF4444",
  },
  surface: {
    white: "#FFFFFF",
    background: "#FFFFFF",
    muted: "#F8FAFC",
    border: "#E2E8F0",
  },
  text: {
    foreground: "#0F172A",
    muted: "#64748B",
    inverse: "#FFFFFF",
  },
  gradients: {
    hero: "from-blue-600 via-blue-500 to-green-600",
    cta: "from-blue-600 via-blue-600 to-green-600",
    success: "from-green-500 to-emerald-700",
    primary: "from-blue-500 to-blue-700",
    warning: "from-amber-500 to-orange-600",
  },
} as const;

export type BrandColorKey = keyof typeof COLORS.brand;
export type SurfaceColorKey = keyof typeof COLORS.surface;
