# Cabeçalhos de segurança

## Estado e limitações

Consulta pública de 22/09/2026: HTTPS retorna 200; HTTP redireciona com 301 para HTTPS. Os seis cabeçalhos do relatório estavam ausentes. Ausência de cabeçalhos não demonstra, por si só, uma vulnerabilidade XSS explorável ou transmissão de dados em HTTP.

O deploy atual é estático no GitHub Pages. Alterações nos arquivos do site não configuram os cabeçalhos HTTP dessa hospedagem. Não criar `_headers` ou `.htaccess` com a expectativa de que o GitHub Pages os aplique.

O HTML de produção agora contém CSP e `meta name="referrer"`. A CSP permite scripts e fontes locais, miniaturas do YouTube e os players de YouTube/Spotify. Estilos inline são necessários para posições da linha do tempo e estilos sem JavaScript; scripts inline permanecem bloqueados, exceto o bootstrap do GTM autorizado pelo hash SHA-256 calculado no build. O modo de desenvolvimento não aplica CSP para permitir Vite/HMR.

## Configuração pendente na camada HTTP

Não aplicada. Requer autorização de publicação e acesso ao proxy/hospedagem. Se for utilizado Cloudflare, o tráfego precisa passar pelo proxy; apenas usar seu DNS não altera as respostas do GitHub Pages. Preparar uma regra restrita a `dreamtheater.com.br` e `www.dreamtheater.com.br`, preservando outras regras existentes.

| Cabeçalho | Valor |
| --- | --- |
| Strict-Transport-Security | `max-age=31536000` |
| Content-Security-Policy | Valor de `src/data/security.ts`, acrescido de `; frame-ancestors 'none'` |
| X-Frame-Options | `DENY` |
| X-Content-Type-Options | `nosniff` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |

Não incluir `includeSubDomains` ou `preload` em HSTS sem verificar todos os subdomínios. Não restringir reprodução, tela cheia ou clipboard, usados pelos players e pelos botões de copiar links.

`frame-ancestors`, HSTS, X-Frame-Options, X-Content-Type-Options e Permissions-Policy não podem ser substituídos por meta tags. O scanner de cabeçalhos continuará apontando ausências até a configuração HTTP ser aplicada. A CSP em meta protege carregamentos da página, mas não impede que outros sites a incorporem.

Após uma publicação autorizada: verificar respostas HTTPS dos dois hosts e redirecionamento HTTP, conferir os seis cabeçalhos, abrir os players e copiar links. Repetir a análise do relatório. Os nove avisos restantes não estavam visíveis no print recebido.

Referências:
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors
- https://developers.cloudflare.com/rules/transform/response-header-modification/
- https://developers.cloudflare.com/ssl/edge-certificates/additional-options/http-strict-transport-security/

## Google Tag Manager

Contêiner instalado: `GTM-WJCQK4MP`, com bootstrap no head e iframe noscript no início do body. Habilitado somente no build de produção, evitando visitas de desenvolvimento. A CSP permite `www.googletagmanager.com` para script, imagem, conexão e frame; o script inline é autorizado por hash, sem liberar `unsafe-inline` ou `unsafe-eval` para scripts. Tags adicionais no contêiner que utilizem outros domínios precisarão ser avaliadas individualmente. Não foram criadas nem publicadas tags dentro do GTM.

Referência: https://developers.google.com/tag-platform/security/guides/csp
