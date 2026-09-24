// Tokens do design system corporativo: fonte única de verdade para cores,
// tipografia, espaçamento, raios e sombras. O CSS publicado em
// `src/pages/design-system.css` é validado contra estes valores nos testes.

export type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;

export const shades: readonly Shade[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

export type PaletteName =
  | "primary"
  | "accent"
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info";

export interface Palette {
  name: PaletteName;
  label: string;
  description: string;
  colors: Record<Shade, string>;
}

export const palettes: readonly Palette[] = [
  {
    name: "primary",
    label: "Primária (Azul corporativo)",
    description: "Cor da marca. Ações principais, links e elementos de destaque.",
    colors: {
      50: "#eff4fb",
      100: "#dbe5f5",
      200: "#b7cbeb",
      300: "#88a8dc",
      400: "#5a82c8",
      500: "#3763b0",
      600: "#264d94",
      700: "#1e3d78",
      800: "#182f5e",
      900: "#0f1f40",
    },
  },
  {
    name: "accent",
    label: "Destaque (Verde-azulado)",
    description: "Cor secundária para realces pontuais, gráficos e ilustrações.",
    colors: {
      50: "#effcf9",
      100: "#cff5ec",
      200: "#9febd9",
      300: "#67d9c2",
      400: "#34bfa7",
      500: "#1aa38c",
      600: "#128372",
      700: "#13695d",
      800: "#14544c",
      900: "#134640",
    },
  },
  {
    name: "neutral",
    label: "Neutra (Cinza-ardósia)",
    description: "Textos, fundos, bordas e superfícies.",
    colors: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
      600: "#475569",
      700: "#334155",
      800: "#1e293b",
      900: "#0f172a",
    },
  },
  {
    name: "success",
    label: "Sucesso",
    description: "Confirmações e estados positivos.",
    colors: {
      50: "#f0fdf4",
      100: "#dcfce7",
      200: "#bbf7d0",
      300: "#86efac",
      400: "#4ade80",
      500: "#22c55e",
      600: "#16a34a",
      700: "#15803d",
      800: "#166534",
      900: "#14532d",
    },
  },
  {
    name: "warning",
    label: "Alerta",
    description: "Avisos que exigem atenção, sem bloquear o usuário.",
    colors: {
      50: "#fffbeb",
      100: "#fef3c7",
      200: "#fde68a",
      300: "#fcd34d",
      400: "#fbbf24",
      500: "#f59e0b",
      600: "#d97706",
      700: "#b45309",
      800: "#92400e",
      900: "#78350f",
    },
  },
  {
    name: "danger",
    label: "Erro",
    description: "Erros, ações destrutivas e validações.",
    colors: {
      50: "#fef2f2",
      100: "#fee2e2",
      200: "#fecaca",
      300: "#fca5a5",
      400: "#f87171",
      500: "#ef4444",
      600: "#dc2626",
      700: "#b91c1c",
      800: "#991b1b",
      900: "#7f1d1d",
    },
  },
  {
    name: "info",
    label: "Informação",
    description: "Mensagens informativas e dicas.",
    colors: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      200: "#bae6fd",
      300: "#7dd3fc",
      400: "#38bdf8",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
      800: "#075985",
      900: "#0c4a6e",
    },
  },
];

export interface ColorRef {
  palette: PaletteName;
  shade: Shade;
}

// Tokens semânticos: o que os componentes devem usar (em vez de tons diretos).
export const semanticColors: Readonly<Record<string, ColorRef>> = {
  "bg": { palette: "neutral", shade: 50 },
  "surface-muted": { palette: "neutral", shade: 100 },
  "border": { palette: "neutral", shade: 300 },
  "text": { palette: "neutral", shade: 900 },
  "text-muted": { palette: "neutral", shade: 600 },
  "brand": { palette: "primary", shade: 700 },
  "brand-hover": { palette: "primary", shade: 800 },
  "brand-subtle": { palette: "primary", shade: 50 },
  "focus": { palette: "primary", shade: 500 },
  "accent": { palette: "accent", shade: 700 },
  "success": { palette: "success", shade: 700 },
  "success-subtle": { palette: "success", shade: 50 },
  "warning": { palette: "warning", shade: 800 },
  "warning-subtle": { palette: "warning", shade: 50 },
  "danger": { palette: "danger", shade: 700 },
  "danger-subtle": { palette: "danger", shade: 50 },
  "info": { palette: "info", shade: 800 },
  "info-subtle": { palette: "info", shade: 50 },
};

// Pares texto/fundo usados pelos componentes; todos devem atender WCAG AA (4.5:1).
export const textPairs: readonly [foreground: string, background: string][] = [
  ["text", "bg"],
  ["text-muted", "bg"],
  ["text-muted", "surface-muted"],
  ["brand", "bg"],
  ["accent", "bg"],
  ["success", "success-subtle"],
  ["warning", "warning-subtle"],
  ["danger", "danger-subtle"],
  ["info", "info-subtle"],
  ["brand", "brand-subtle"],
];

export const fontFamily = {
  sans: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
} as const;

export const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
} as const;

export const spacing = {
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
  12: "3rem",
} as const;

export const radii = {
  sm: "4px",
  md: "6px",
  lg: "10px",
  full: "9999px",
} as const;

export const shadows = {
  sm: "0 1px 2px rgba(15, 23, 42, 0.06)",
  md: "0 4px 12px rgba(15, 23, 42, 0.08)",
  lg: "0 12px 32px rgba(15, 23, 42, 0.12)",
} as const;

export function getPalette(name: PaletteName): Palette {
  const palette = palettes.find((p) => p.name === name);
  if (!palette) throw new Error(`Paleta desconhecida: ${name}`);
  return palette;
}

export function resolveColor(ref: ColorRef): string {
  return getPalette(ref.palette).colors[ref.shade];
}

export function resolveSemantic(token: string): string {
  const ref = semanticColors[token];
  if (!ref) throw new Error(`Token semântico desconhecido: ${token}`);
  return resolveColor(ref);
}

export function hexToRgb(hex: string): [number, number, number] {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) throw new Error(`Cor hexadecimal inválida: ${hex}`);
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 0xff, (value >> 8) & 0xff, value & 0xff];
}

// Luminância relativa conforme a definição da WCAG 2.x.
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

// Cor de texto (branco ou quase-preto) com melhor contraste sobre o fundo.
export function readableTextColor(background: string): string {
  const white = "#ffffff";
  const dark = getPalette("neutral").colors[900];
  return contrastRatio(background, white) >= contrastRatio(background, dark) ? white : dark;
}

// Gera as declarações de variáveis CSS (`--nome: valor;`) de todos os tokens.
export function toCssVariables(): string[] {
  const lines: string[] = [];
  for (const palette of palettes) {
    for (const shade of shades) {
      lines.push(`--color-${palette.name}-${shade}: ${palette.colors[shade]};`);
    }
  }
  for (const [token, ref] of Object.entries(semanticColors)) {
    lines.push(`--color-${token}: var(--color-${ref.palette}-${ref.shade});`);
  }
  lines.push(`--color-surface: #ffffff;`);
  for (const [key, value] of Object.entries(fontFamily)) lines.push(`--font-${key}: ${value};`);
  for (const [key, value] of Object.entries(fontSizes)) lines.push(`--font-size-${key}: ${value};`);
  for (const [key, value] of Object.entries(spacing)) lines.push(`--space-${key}: ${value};`);
  for (const [key, value] of Object.entries(radii)) lines.push(`--radius-${key}: ${value};`);
  for (const [key, value] of Object.entries(shadows)) lines.push(`--shadow-${key}: ${value};`);
  return lines;
}
