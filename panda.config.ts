import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
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
    },
  },
  outdir: "styled-system",
});
