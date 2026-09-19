# Dream Theater Brasil

Hub brasileiro independente de curadoria: **RELEMBRE · VEJA · VÁ · TOQUE · OUÇA**.

Uma página em Astro e TypeScript, com CSS próprio, fontes locais e JavaScript somente para filtros, indicação de seção e players sob demanda. Sem React, backend, SSR, banco de dados ou serviços de IA. O build gera apenas arquivos estáticos em `dist/`.

## Executar

Use **Node.js 24 LTS** (mínimo 22.19) e npm.

```sh
npm ci
npm run dev
```

A prévia fica em `http://localhost:4321`. O Astro 7 gerencia o processo de desenvolvimento; use `npx astro dev stop` para encerrá-lo.

```sh
npm run check
npm run build
npm run validate:build
npm run preview
```

O build usa apenas dados e imagens já presentes no repositório. Não consulta Spotify, YouTube, setlist.fm ou redes sociais para gerar a página.

## Conteúdo da primeira versão

Pesquisa registrada em **19/09/2026**:

- 7 registros individuais do setlist.fm, exclusivamente de shows no Brasil, em ordem decrescente.
- 6 vídeos do canal oficial Dream Theater, confirmados também por oEmbed e metadados de incorporação.
- 6 projetos brasileiros de tributo e 6 guitarristas com conteúdo de Dream Theater, incluindo Samuel Zechin, Marcelo Barbosa e Alex Lima. A seleção inclui os quatro perfis de tributos indicados pelo responsável pelo projeto e o site do VRA!.
- 14 materiais de guitarra, baixo, bateria e teclado, incluindo os ebooks de Distance Over Time e Selections from The Astonishing na Freenote. Edições digitais e físicas identificadas; acesso à busca completa da loja. Freenote confirmada na Rua Teodoro Sampaio, 785, São Paulo.
- Os 28 lançamentos do índice oficial: 16 de estúdio, 10 ao vivo, 1 coletânea e 1 EP. Os 27 links Spotify vêm exclusivamente das páginas oficiais de cada álbum.

**Exceções de conteúdo tratadas explicitamente:** a agenda oficial consultada não trouxe datas futuras depois da pesquisa; a interface informa isso e oferece acesso à agenda. `Live at Luna Park` não contém Spotify em sua página oficial e leva ao site oficial. Alguns cabeçalhos antigos da discografia apresentam 2024 incorretamente; os anos históricos foram conferidos nos metadados e arquivos do próprio site.

## Atualizar a curadoria

Os dados ficam em `src/data/`, separados da apresentação:

| Arquivo | Conteúdo |
| --- | --- |
| `setlists.ts` | Datas, locais, turnês e links individuais |
| `videos.ts` | IDs YouTube e páginas de origem |
| `shows.ts` | Somente apresentações futuras confirmadas |
| `coverBands.ts` | Tributos, redes e evidências de atividade |
| `guitarists.ts` | Músicos, redes, retratos e evidências |
| `materials.ts` | Produtos e materiais por instrumento |
| `discography.ts` | Índice oficial, capas e Spotify por álbum |
| `site.ts` | Metadados, data da pesquisa e WhatsApp |

Consulte `docs/research/` para as URLs e evidências, inclusive as limitações da verificação. Atualize a data de pesquisa somente depois de conferir as informações. A seção Relembre aceita somente shows realizados no Brasil. Não promova shows passados a “próximos shows”. Não deduza perfis sociais pelo nome.

Para atualizar a discografia, consulte primeiro o índice e cada página em `dreamtheater.net`, atualize `docs/research/discography.json` e execute `npm run sync:images`. Esse comando de manutenção baixa as capas oficiais, gera WebP local e atualiza `discography.ts`. Exige acesso à internet; não faz parte do build. Os retratos são dos sites dos músicos e as fontes estão documentadas.

## Verificações

```sh
npm run check            # TypeScript, completude, datas e procedência do Spotify
npm run build
npm run validate:build   # HTML, metadados, assets, âncoras e ausência de servidor
npm run validate:links   # Rede; salva o relatório em docs/research/link-check.json
npm run test:e2e         # Chrome: desktop, mobile, teclado, filtros e acessibilidade
```

Os testes usam Chrome instalado. Se necessário, execute `npx playwright install chrome`. `scripts/serve-static.mjs` serve apenas `dist/` durante o teste; não é backend da aplicação e não é publicado. Para medir as interações independentemente de publicidade/login, os testes de players substituem somente o documento externo do iframe. A disponibilidade real dos seis vídeos e dos 27 álbuns foi conferida separadamente e está documentada.

Instagram pode exigir login; HTTP 200 nessa tela não é confirmação de acesso ao perfil. O relatório distingue `ok`, `login-gated`, `restricted`, `unavailable`, `broken` e `deployment-pending`. Embeds e imagens de YouTube continuam sujeitos às regras de cada plataforma. Links diretos permanecem disponíveis; conteúdo e destinos também funcionam sem JavaScript, enquanto os filtros são ocultados nesse caso.

Resultados e limitações: [docs/VALIDATION.md](docs/VALIDATION.md). No navegador automatizado, a reprodução real do YouTube retornou indisponibilidade para dois vídeos testados, apesar de metadados válidos; sua causa não foi determinada. O carregamento real do álbum Spotify foi confirmado. Verifique novamente o YouTube após publicar no domínio definitivo.

## Publicar no GitHub Pages

O fluxo está preparado em `.github/workflows/deploy.yml`, com build e verificações antes da publicação.

1. Envie o projeto a um repositório do GitHub, na branch `main`.
2. Em **Settings → Pages → Build and deployment**, escolha **GitHub Actions**.
3. Em **Custom domain**, configure `dreamtheater.com.br` e os registros DNS recomendados pelo GitHub. Ative **Enforce HTTPS** quando o certificado estiver disponível.
4. Faça um push para `main` ou execute **Deploy to GitHub Pages** manualmente na aba Actions.

O projeto já contém `public/CNAME`, `.nojekyll`, favicon, `robots.txt`, `sitemap.xml`, canonical, Open Graph e Twitter Cards. `astro.config.mjs` usa `site: 'https://dreamtheater.com.br'`, saída estática e nenhuma base de subdiretório. O workflow publica exclusivamente `dist/`.

Fontes de implantação: [Astro no GitHub Pages](https://docs.astro.build/en/guides/deploy/github/) e [domínio personalizado no GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

O remoto `origin` está configurado para [ericmgomes/site-dreamtheater](https://github.com/ericmgomes/site-dreamtheater). A publicação depende de permissão de escrita no repositório, ativação do GitHub Pages e configuração do domínio. Esses recursos não são criados pelo build local.

## Créditos

Feito por [Eric Gomes](https://bio.ericgomes.me). Projeto brasileiro independente, não afiliado oficialmente ao Dream Theater. Capas, fotografias, música e marcas pertencem aos respectivos titulares. Capas e referências da discografia vêm do site oficial; thumbnails são fornecidas pelo YouTube. O projeto organiza links e não redistribui músicas, vídeos, livros ou transcrições comerciais.
