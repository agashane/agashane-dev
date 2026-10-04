// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import pandacss from "@pandacss/vite";

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Inclusive Sans",
      cssVariable: "--font-inclusive-sans",
      weights: ["300 900"],
    },
  ],
  vite: {
    plugins: [pandacss()],
  },
});
