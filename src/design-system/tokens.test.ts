import { describe, expect, it } from "vitest";
import css from "../pages/design-system.css?raw";
import html from "../pages/design-system.html?raw";
import {
  contrastRatio,
  getPalette,
  hexToRgb,
  palettes,
  readableTextColor,
  relativeLuminance,
  resolveSemantic,
  semanticColors,
  shades,
  textPairs,
  toCssVariables,
} from "./tokens.js";

describe("paletas", () => {
  it("têm nomes únicos e os 10 tons em hexadecimal", () => {
    expect(new Set(palettes.map((p) => p.name)).size).toBe(palettes.length);
    for (const palette of palettes) {
      expect(Object.keys(palette.colors).map(Number)).toEqual([...shades]);
      for (const hex of Object.values(palette.colors)) expect(hex).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("escurecem progressivamente do tom 50 ao 900", () => {
    for (const palette of palettes) {
      const luminances = shades.map((s) => relativeLuminance(palette.colors[s]));
      for (let i = 1; i < luminances.length; i++) {
        expect(luminances[i]).toBeLessThan(luminances[i - 1]);
      }
    }
  });

  it("getPalette falha para paleta desconhecida", () => {
    expect(getPalette("primary").colors[700]).toBe("#1e3d78");
    expect(() => getPalette("roxo" as never)).toThrow(/desconhecida/);
  });
});

describe("cores semânticas", () => {
  it("resolvem para tons existentes", () => {
    expect(resolveSemantic("brand")).toBe(getPalette("primary").colors[700]);
    expect(() => resolveSemantic("inexistente")).toThrow(/desconhecido/);
  });

  it("pares de texto atendem contraste WCAG AA (4.5:1)", () => {
    for (const [fg, bg] of textPairs) {
      expect(contrastRatio(resolveSemantic(fg), resolveSemantic(bg)), `${fg} sobre ${bg}`).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("botões com texto branco atendem contraste AA", () => {
    for (const token of ["brand", "brand-hover", "danger"]) {
      expect(contrastRatio("#ffffff", resolveSemantic(token))).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("utilitários de cor", () => {
  it("hexToRgb converte e valida", () => {
    expect(hexToRgb("#1e3d78")).toEqual([30, 61, 120]);
    expect(() => hexToRgb("azul")).toThrow(/inválida/);
    expect(() => hexToRgb("#fff")).toThrow(/inválida/);
  });

  it("contrastRatio segue a WCAG e é simétrico", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 5);
    expect(contrastRatio("#ffffff", "#ffffff")).toBe(1);
    expect(contrastRatio("#1e3d78", "#f8fafc")).toBe(contrastRatio("#f8fafc", "#1e3d78"));
  });

  it("readableTextColor escolhe branco em fundo escuro e escuro em fundo claro", () => {
    expect(readableTextColor("#0f1f40")).toBe("#ffffff");
    expect(readableTextColor("#eff4fb")).toBe(getPalette("neutral").colors[900]);
  });
});

describe("design-system.css", () => {
  it("declara em :root todas as variáveis geradas pelos tokens", () => {
    const root = css.match(/:root\s*\{([^}]*)\}/)?.[1] ?? "";
    const declared = root
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    expect(declared).toEqual(toCssVariables());
  });

  it("gera uma variável para cada tom e cada token semântico", () => {
    const vars = toCssVariables();
    expect(vars).toContain("--color-primary-50: #eff4fb;");
    expect(vars).toContain("--color-brand: var(--color-primary-700);");
    expect(vars.filter((v) => /^--color-[a-z]+-\d+:/.test(v))).toHaveLength(palettes.length * shades.length);
  });

  it("define os componentes base", () => {
    for (const cls of [".ds-btn--primary", ".ds-btn--secondary", ".ds-input", ".ds-card", ".ds-alert--danger", ".ds-badge"]) {
      expect(css).toContain(cls);
    }
  });
});

describe("página design-system.html", () => {
  it("carrega o CSS por caminho relativo e é responsiva", () => {
    expect(html).toMatch(/<link rel="stylesheet" href="design-system.css" \/>/);
    expect(html).toMatch(/<meta name="viewport" content="width=device-width, initial-scale=1"/);
    expect(html).toMatch(/@media \(max-width: 640px\)/);
  });

  it("apresenta todas as paletas com todos os tons e valores hexadecimais", () => {
    for (const palette of palettes) {
      expect(html).toContain(`id="palette-${palette.name}"`);
      expect(html).toContain(`<h3>${palette.label}</h3>`);
      for (const shade of shades) {
        const hex = palette.colors[shade];
        expect(html).toContain(
          `style="background: var(--color-${palette.name}-${shade}); color: ${readableTextColor(hex)}"><span class="swatch-shade">${shade}</span><code>${hex}</code>`,
        );
      }
    }
  });

  it("documenta os tokens semânticos principais", () => {
    for (const token of ["bg", "text", "brand", "success", "warning", "danger", "info"]) {
      expect(semanticColors[token]).toBeDefined();
      expect(html).toContain(`<code>--color-${token}</code>`);
    }
  });
});
