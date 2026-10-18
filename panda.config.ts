import { defineConfig } from "@pandacss/dev";
import typographyPreset from "@pandacss/preset-typography";
import { preset } from "@okapi-ui/panda-preset";

export default defineConfig({
  presets: [
    "@pandacss/preset-base",
    "@pandacss/preset-panda",
    typographyPreset(),
    preset,
  ],
  preflight: true,
  include: ["./src/**/*.{astro,js,ts}"],
  exclude: [],
  theme: {
    extend: {
      tokens: {
        fonts: {
          heading: { value: "var(--font-inclusive-sans), serif" },
          body: { value: "var(--font-inclusive-sans), sans-serif" },
        },
      },
    },
  },
  globalCss: {
    html: {
      "--global-font-body": "var(--font-inclusive-sans), sans-serif",
      colorPalette: "slate",
    },
  },
  outdir: "styled-system",
});
