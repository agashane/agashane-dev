interface ImportMetaEnv {
  readonly PUBLIC_WEBSITE_URL: string;
  readonly PUBLIC_CF_ANALYTICS_TOKEN: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
