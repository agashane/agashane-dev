import { defineConfig } from "jsrepo";

export default defineConfig({
  // configure where stuff comes from here
  registries: ["@okapi-ui/astro"],
  // configure where stuff goes here
  paths: {
    ui: './src/components/ui',
  },
});
