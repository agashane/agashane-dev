// @ts-check
import { defineConfig, fontProviders } from "astro/config";

import cloudflare from "@astrojs/cloudflare";
import pandacss from "@pandacss/vite";
import { loadEnv } from "vite";
import iconset from "astro-iconset";

import sitemap from "@astrojs/sitemap";

import aeo from "astro-aeo";

// @ts-expect-error
const { PUBLIC_WEBSITE_URL } = loadEnv(process.env.NODE_ENV, process.cwd(), "");

// https://astro.build/config
export default defineConfig({
  site: PUBLIC_WEBSITE_URL,
  adapter: cloudflare(),
  trailingSlash: "always",

  i18n: {
    locales: ["en", "fr"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: true,
    },
  },

  redirects: {
    "/": "/en",
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

  integrations: [sitemap({
    i18n: {
      defaultLocale: "en",
      locales: {
        en: "en-US",
        fr: "fr-FR",
      },
    },
  }), iconset(), aeo()],

  session: false,
});