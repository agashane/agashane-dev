// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import pandacss from "@pandacss/vite";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  trailingSlash: "never",
  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inclusive Sans",
      cssVariable: "--font-inclusive-sans",
      weights: ["300 700"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Fragment Mono",
      cssVariable: "--font-fragment-mono",
      weights: ["400"],
    },
  ],
  vite: {
    plugins: [pandacss()],
  },
});
