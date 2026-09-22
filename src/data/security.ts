import { createHash } from 'node:crypto';
import { gtmBootstrap } from './analytics';
const gtmHash = createHash('sha256').update(gtmBootstrap).digest('base64');
// Meta-compatible policy for the static build. Dev mode needs Vite's scripts/websocket.
export const contentSecurityPolicy = [
  "default-src 'none'",
  `script-src 'self' 'sha256-${gtmHash}' https://www.googletagmanager.com`,
  "style-src 'self' 'unsafe-inline'", // Timeline positions and the no-JS filter style.
  "img-src 'self' https://i.ytimg.com https://www.googletagmanager.com",
  "font-src 'self'",
  "connect-src 'self' https://www.googletagmanager.com",
  "frame-src https://www.youtube-nocookie.com https://open.spotify.com https://www.googletagmanager.com",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join('; ');
