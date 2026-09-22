// Deploy as a Cloudflare Worker route in front of the existing GitHub Pages origin.
// This file is not part of the static Pages deployment.
export function prefersMarkdown(accept = '') {
  const ranges = accept.toLowerCase().split(',').map(part => {
    const [type, ...params] = part.trim().split(';');
    const value = params.find(param => param.trim().startsWith('q='))?.trim().slice(2);
    const q = value === undefined ? 1 : Number(value);
    return { type: type.trim(), q: Number.isFinite(q) && q >= 0 && q <= 1 ? q : 0 };
  });
  // Wildcards alone do not opt browsers into Markdown.
  const markdown = ranges.find(range => range.type === 'text/markdown')?.q ?? 0;
  const html = ranges.find(range => range.type === 'text/html')?.q
    ?? ranges.find(range => range.type === 'text/*')?.q
    ?? ranges.find(range => range.type === '*/*')?.q ?? 0;
  return markdown > 0 && markdown >= html;
}

const errorBody = `# 404 — Página não encontrada

O endereço solicitado não existe no Dream Theater Brasil. Consulte os links abaixo para encontrar o conteúdo disponível.

- [Página inicial](https://dreamtheater.com.br/)
- [Mapa do site](https://dreamtheater.com.br/sitemap.xml)
`;

export async function handleRequest(request, fetchOrigin = fetch) {
  const origin = await fetchOrigin(request);
  if (origin.status !== 404 || !['GET', 'HEAD'].includes(request.method)) return origin;
  const headers = new Headers(origin.headers);
  const vary = headers.get('Vary');
  if (vary !== '*' && !vary?.split(',').some(name => name.trim().toLowerCase() === 'accept')) {
    headers.set('Vary', vary ? `${vary}, Accept` : 'Accept');
  }
  // Do not let a shared cache serve the negotiated body to the wrong client.
  headers.set('Cache-Control', 'no-store');
  headers.delete('CDN-Cache-Control');
  headers.delete('Cloudflare-CDN-Cache-Control');
  if (!prefersMarkdown(request.headers.get('Accept') ?? '')) {
    return new Response(request.method === 'HEAD' ? null : origin.body, { status: 404, headers });
  }
  await origin.body?.cancel();
  for (const name of ['Content-Length', 'Content-Encoding', 'ETag', 'Last-Modified', 'Content-Range', 'Accept-Ranges']) headers.delete(name);
  headers.set('Content-Type', 'text/markdown; charset=utf-8');
  headers.set('X-Content-Type-Options', 'nosniff');
  return new Response(request.method === 'HEAD' ? null : errorBody, { status: 404, headers });
}

export default { fetch: request => handleRequest(request) };
