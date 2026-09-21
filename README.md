# Dream Theater Brasil

Hub brasileiro independente de curadoria: **SHOWS · VEJA · COVERS · TOQUE · OUÇA**.

Uma página em Astro e TypeScript, com CSS próprio, fontes locais e JavaScript para paginação ao rolar o histórico e a lista de vídeos, filtros, indicação de seção e players sob demanda. Sem React, backend, SSR, banco de dados ou serviços de IA. O build gera apenas arquivos estáticos em `dist/`.

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

## Conteúdo atual

Pesquisa registrada em **19/09/2026**:

- Todos os 48 registros brasileiros identificados no setlist.fm, de 1997 a 2026, em ordem decrescente. Cards compactos em 3 colunas no desktop, 2 no tablet e 1 no celular, com data, cidade, local e turnê; o card inteiro abre o setlist. Histórico com rolagem vertical e carregamento automático de mais 12 shows ao chegar ao fim; mantém os anteriores visíveis. Linha do tempo lateral com os 12 anos de apresentações: o marcador acompanha a rolagem, inclusive ao voltar e carregar novos lotes. Botão “Carregar mais shows” como alternativa; sem JavaScript, os 48 ficam disponíveis na lista e a linha do tempo interativa fica oculta.
- Ranking de 50 vídeos de shows do Dream Theater no Brasil: 6 destaques com miniaturas compactas e outros 44 links em uma lista com rolagem própria, revelados em lotes de 5. Ordenados por visualizações totais entre 64 candidatos brasileiros verificados em 21/09/2026. Vídeos bloqueados no Brasil foram excluídos; trechos e solos estão identificados. A seleção não é um censo de todo o YouTube.
- 7 projetos brasileiros de tributo e músicos separados por instrumento: 6 guitarristas (incluindo Samuel Zechin, Marcelo Barbosa e Alex Lima), 3 baixistas (Felipe Campos, Alexandre Panta e Felipe Andreoli) e 3 tecladistas (Daniel Jorge, César Zolhof e Junior Carelli). A seleção mantém todos os projetos indicados pelo responsável pelo site.
- 14 materiais de guitarra, baixo, bateria e teclado, incluindo os ebooks de Distance Over Time e Selections from The Astonishing na Freenote. Edições digitais e físicas identificadas; acesso à busca completa da loja. Freenote confirmada na Rua Teodoro Sampaio, 785, São Paulo.
- Os 28 lançamentos do índice oficial: 16 de estúdio, 10 ao vivo, 1 coletânea e 1 EP. Os 27 links Spotify vêm exclusivamente das páginas oficiais de cada álbum.

**Exceções de conteúdo tratadas explicitamente:** o bloco de próximos shows está temporariamente fora da página, a pedido do responsável pelo site. `Live at Luna Park` não contém Spotify em sua página oficial e leva ao site oficial. Alguns cabeçalhos antigos da discografia apresentam 2024 incorretamente; os anos históricos foram conferidos nos metadados e arquivos do próprio site.

## Atualizar a curadoria

Os dados ficam em `src/data/`, separados da apresentação:

| Arquivo | Conteúdo |
| --- | --- |
| `setlists.ts` | Datas, locais, turnês e links individuais |
| `videos.ts` | Ranking brasileiro, IDs YouTube, contagens, local e canal |
| `shows.ts` | Dados reservados para futuras apresentações; bloco temporariamente fora da página |
| `coverBands.ts` | Tributos, redes, fotos de perfil e evidências de atividade |
| `guitarists.ts` | Guitarristas, redes, retratos e evidências |
| `coverMusicians.ts` | Baixistas e tecladistas, redes, fotos de perfil e evidências |
| `materials.ts` | Produtos e materiais por instrumento |
| `discography.ts` | Índice oficial, capas e Spotify por álbum |
| `site.ts` | Metadados, data da pesquisa e WhatsApp |

Consulte `docs/research/` para as URLs e evidências, inclusive as limitações da verificação. Atualize a data de pesquisa somente depois de conferir as informações. A seção Shows apresenta somente o histórico de shows no Brasil. O componente `UpcomingShows.astro` está reservado para uma futura reativação e não é renderizado. Os IDs de âncora `relembre` e `va` foram preservados para manter links antigos funcionando. Ao ampliar o histórico, atualize os registros e o manifesto de cobertura `docs/research/brazil-setlists.json`; ele confere o total, os anos e a correspondência com as fontes por período. Shows cancelados e workshops ficam fora do histórico. Não promova shows passados a “próximos shows”. Não deduza perfis sociais pelo nome.

Para atualizar o ranking, pesquise registros brasileiros, confira título/descrição, contagem inteira, canal e disponibilidade territorial no YouTube. Atualize os arquivos `docs/research/youtube-*-candidates.json`, o manifesto `youtube-ranking.json` e `src/data/videos.ts`. A validação exige que os 50 selecionados sejam os mais vistos entre os candidatos elegíveis e que os seis destaques permitam incorporação. As contagens são totais do vídeo, não apenas de espectadores brasileiros. Sem JavaScript, os 44 links continuam disponíveis na área de rolagem.

Os vídeos da seção Veja abrem em um modal com 96% da largura da tela, pelas miniaturas, títulos e links do ranking. O player é criado apenas ao abrir e removido ao fechar por botão, Escape ou clique fora. O modal mantém um link direto para o YouTube; sem JavaScript ou com clique modificado, os links abrem normalmente na plataforma.

Para atualizar a discografia, consulte primeiro o índice e cada página em `dreamtheater.net`, atualize `docs/research/discography.json` e execute `npm run sync:images`. Esse comando de manutenção baixa as capas oficiais, gera WebP local e atualiza `discography.ts`. Exige acesso à internet; não faz parte do build.

As fotos de perfil dos covers e músicos ficam em `public/images/profiles/`, em WebP, com fontes registradas em `docs/research/profile-images-*.json`. São cópias dos perfis públicos do Instagram; Felipe Campos e César Zolhof usam as fotos dos canais oficiais do YouTube, pois não há Instagram confirmado. A atualização das fotos é manual: confira o perfil, substitua o arquivo local e registre a fonte e a data. O site não depende de URLs temporárias do Instagram nem faz consultas à rede durante o build. As fotos são exibidas em cores, com recorte circular e carregamento tardio; um item sem imagem usa as iniciais como alternativa.

## Verificações

```sh
npm run check            # TypeScript, completude, datas e procedência do Spotify
npm run build
npm run validate:build   # HTML, metadados, assets, âncoras e ausência de servidor
npm run validate:links   # Rede; salva o relatório em docs/research/link-check.json
npm run test:e2e         # Chrome: desktop, mobile, teclado, filtros e acessibilidade
```

Os testes usam Chrome instalado. Se necessário, execute `npx playwright install chrome`. `scripts/serve-static.mjs` serve apenas `dist/` durante o teste; não é backend da aplicação e não é publicado. Para medir as interações independentemente de publicidade/login, os testes de players substituem somente o documento externo do iframe. Os metadados de disponibilidade no Brasil e incorporação dos vídeos, e os 27 destinos Spotify, são conferidos separadamente. Metadados válidos não comprovam reprodução integral no navegador.

Instagram pode exigir login; HTTP 200 nessa tela não é confirmação de acesso ao perfil. O relatório distingue `ok`, `login-gated`, `restricted`, `unavailable`, `broken` e `deployment-pending`. Embeds e imagens de YouTube continuam sujeitos às regras de cada plataforma. Links diretos permanecem disponíveis; conteúdo e destinos também funcionam sem JavaScript, enquanto os filtros são ocultados nesse caso.

Resultados e limitações: [docs/VALIDATION.md](docs/VALIDATION.md). O primeiro vídeo do ranking, These Walls, iniciou reprodução real na prévia local; os demais possuem metadados de disponibilidade e incorporação verificados, sem teste integral de reprodução. O carregamento real do álbum Spotify foi confirmado em validação anterior. Verifique novamente os players após publicar no domínio definitivo.

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

O hero usa **dreamsoftheatre**, de JoannaVu, uma fonte inspirada no lettering da banda e disponível para uso não comercial. Arquivo local, origem e condições em [src/assets/fonts/README.md](src/assets/fonts/README.md).

O favicon usa o símbolo Majesty dourado sobre fundo preto, a partir dos arquivos de ícone publicados no [site oficial do Dream Theater](https://dreamtheater.net/). Versões PNG de 32, 192 e 180 px copiadas sem modificação e servidas localmente; fontes registradas em `docs/research/favicon.json`.
