---
title: "How to Setup Custom Fonts in Astro with Panda: A Step-by-Step Guide"
slug: "setup-custom-fonts-astrojs-pandacss"
excerpt: "Learn how to integrate custom fonts in Astro using PandaCSS. This guide covers the Astro Font API, Fontsource, and setting up design tokens for a high-performance, type-safe website."
createdAt: 2026-03-23T08:11:49.537Z
updatedAt: 2026-03-23T08:11:49.537Z
publishedAt: 2026-03-23T08:11:49.537Z
tags: ["guide"]
locale: "en"
isDraft: false
---

Setting up custom fonts shouldn't slow down your site. [Astro](https://astro.build) makes it incredibly easy to manage local fonts and those provided by [Google Fonts](https://fonts.google.com) or [Fontsource](https://fontsource.org) through a unified, fully customizable and type-safe API, but combining it with a "build-time" CSS-in-JS tool like [Panda](https://panda-css.com) requires a few specific steps.

In this guide, I will show you how to seamlessly integrate your favorite typefaces into an Astro project. Whether you are building a high-performance landing page or a complex SaaS dashboard, you’ll learn how to configure your design tokens in PandaCSS to work perfectly with Astro's font optimization.

## Step 1: Initialize Your Astro Project

First, we need a fresh environment. You can quickly scaffold a new Astro project using the CLI. Open your terminal and run:

```nu
pnpm create astro@latest
```

If you already have a project running, ensure you are on the latest version of Astro to take full advantage of the built-in font optimization features.

## Step 2: Integrate PandaCSS for Styling

Once your Astro project is ready, it’s time to add Panda. Panda is excellent because it provides type-safe styles with zero runtime overhead—perfect for keeping your Astro site lightweight.

To get started, follow the official [PandaCSS Astro integration guide](https://panda-css.com/docs/installation/astro). This will walk you through:

- Installing the `@pandacss/dev` package.

- Initializing your `panda.config.ts` file.

- Adding the Panda CSS generation script to your `package.json`.

> Pro-Tip
>
> Make sure your panda.config.ts is in the root directory so it can correctly scan your .astro and .tsx files for style tokens.

## Step 3: Configure the Astro Font API

To keep our site fast, we will use Astro’s built-in font optimization. This allows us to load fonts efficiently without slowing down the initial page load.

> Developer Tip
>
> I recommend renaming your configuration file from `astro.config.mjs` to `astro.config.ts`. Using TypeScript for your config gives you excellent autocomplete in your code editor, making it easier to see which options are available.

For this project, we are using [Fontsource](https://fontsource.org) as our provider, but Astro also supports [Google Fonts](https://fonts.google.com), [Adobe](https://fonts.adobe.com/), local files and many others. We will use two modern variable fonts: [Darker Grotesque](https://fontsource.org/fonts/darker-grotesque) for body text and [Bricolage Grotesque](https://fontsource.org/fonts/bricolage-grotesque) for headings.

Update your `astro.config.ts` like this:

```ts
import { defineConfig, fontProviders } from "astro/config";

export default defineConfig({
  fonts: [
    {
      provider: fontProviders.fontSource(),
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage-grotesque",
      weights: ["700"], // Load only the bold variant: weight = 700
    },
    {
      provider: fontProviders.fontSource(),
      name: "Darker Grotesque",
      cssVariable: "--font-darker-grotesque",
      weights: ["300 900"], // Load all variants from Light = 300 to Black = 900
    },
  ],
});
```

By defining a `cssVariable`, we create a bridge between Astro's optimized loading and our styling system.

## Step 4: Inject and Apply Your Custom Fonts

Now that the fonts are configured in the Astro settings, we need to do two things: inject them into our HTML and register them as design tokens in PandaCSS.

### 1. Add the <Font /> Component

In your main layout file (e.g., `src/layouts/Layout.astro`), you must include the `<Font />` component within the `<head>` tag. This tells Astro to actually load the font files.

In the `<Font />` component, you must pass the variable name configured in `astro.config.ts`.

```astro
---
// src/layouts/Layout.astro
import { Font } from 'astro:assets'; // Import the component
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <Font cssVariable="--font-darker-grotesque" />
   <Font cssVariable="--font-bricolage-grotesque" />
  </head>
  <body>
    <slot />
  </body>
</html>
```

You can also choose to `preload` fonts. If this directive is enabled, the browser will immediately start downloading fonts during page load. But preloading too many fonts can impact your perfomance. So, configure only what you want to load.

```astro
---
// src/layouts/Layout.astro
import {Font} from "astro:assets"
---
<Font cssVariable="--font-darker-grotesque" preload />
<Font cssVariable="--font-bricolage-grotesque" preload={[
  { weight: "700"}
]} />

```

### 2. Connect to PandaCSS

To use these fonts with Panda’s utility classes (like `fontFamily: 'heading'`), update your `panda.config.ts`. We map the CSS variables we created in Step 3 to Panda's theme tokens.

```ts
// panda.config.ts
import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // ... rest of config
  theme: {
    extend: {
      tokens: {
        fonts: {
          heading: { value: "var(--font-bricolage-grotesque), serif" },
          body: { value: "var(--font-darker-grotesque), sans-serif" },
        },
      },
    },
  },

  // OR you can set global variable
  globalCss: {
    html: {
      "--global-font-body": "var(--font-darker-grotesque), sans-serif",
    },
  },
});
```

Now you can use them anywhere in your project like this:

```astro
---
import {css} from "styled-system/css"
---
<div>
    <h1 class={css({ fontFamily: 'heading' })}>Hello World</h1>
    <p class={css({ fontFamily: "body", fontSize: "xl"})}>Lorem ipsum...</p>

    <!-- Here is applied the global font set in the --global-font-body -->
    <p>From --global-font-body</p>
</div>
```

## Conclusion: High-Performance Typography Made Simple

By combining Astro’s native font optimization with Panda, you get the best of both worlds: a website that loads incredibly fast and a developer experience that is type-safe and scalable.

Using this approach ensures that your custom fonts like _Bricolage Grotesque_ and _Darker Grotesque_ are loaded without layout shifts, keeping your Google Lighthouse scores high and your users happy.

Whether you are building a small landing page or a massive e-commerce site with MedusaJS, mastering these small configuration details is what separates a good website from a great one.

## 📚 Further Reading & Resources

To dive deeper into the tools we used in this guide, I highly recommend checking out the official documentation. These are the best places to learn about more advanced configurations:

### Core Frameworks

- [Astro Documentation](https://docs.astro.build): Learn more about island architecture and how Astro handles static site generation (SSG).
- [Astro official guide to use custom fonts](https://docs.astro.build/en/guides/fonts/)
- [Astro Font configuration reference](https://docs.astro.build/en/reference/configuration-reference/#fonts): Learn about available properties to configure your fonts
- [Panda Docs](https://panda-css.com/docs/overview/getting-started): Explore how to build a full design system using "Build-time CSS-in-JS."
