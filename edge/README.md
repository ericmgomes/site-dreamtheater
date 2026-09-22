# Respostas 404 para agentes

Implementação preparada, **não publicada**. O GitHub Pages estático não executa este Worker. Commit/push do site, isoladamente, não ativa a negociação de conteúdo.

`worker.mjs` consulta a origem e transforma somente respostas 404 de GET/HEAD quando o cliente prefere explicitamente `Accept: text/markdown`. Retorna status 404, `Content-Type: text/markdown; charset=utf-8`, explicação e link para o sitemap. Navegadores continuam recebendo HTML. Respostas 200, redirects e erros da origem são preservados. As variantes 404 usam `Vary: Accept` e `no-store`.

## Testar localmente

```sh
node --test edge/worker.test.mjs
```

## Ativação futura, somente mediante autorização

Requer acesso à conta Cloudflare da zona, hosts com proxy ativo e HTTPS válido entre Cloudflare e GitHub Pages. Revisar rotas existentes antes de instalar, para não substituir Workers existentes. Usar **Worker Routes**, mantendo GitHub Pages como origem; não criar Custom Domain para este Worker. A configuração de exemplo em `wrangler.jsonc` cobre apenas o domínio do projeto e www.

Após autorização e revisão, publicar com Wrangler usando `edge/wrangler.jsonc`. Não foi alterado DNS, proxy, hospedagem ou CI neste trabalho. Este Worker resolve negociação de 404; os cabeçalhos de segurança gerais continuam descritos em `docs/SECURITY-HEADERS.md`.

Após ativação:

```sh
curl -sS -L -i -H 'Accept: text/markdown' https://dreamtheater.com.br/caminho-inexistente
curl -sS -L -i -H 'Accept: text/html' https://dreamtheater.com.br/caminho-inexistente
```

Confirmar 404 em ambos, Markdown somente no primeiro, link do sitemap e HTML no segundo. Conferir também a home (200) e o redirecionamento www.

Referências oficiais: https://developers.cloudflare.com/workers/configuration/routing/routes/ e https://developers.cloudflare.com/workers/examples/modify-response/
