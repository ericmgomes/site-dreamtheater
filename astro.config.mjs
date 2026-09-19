import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://dreamtheater.com.br',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  devToolbar: { enabled: false },
});
