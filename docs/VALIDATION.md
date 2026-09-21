# Validação — 19/09/2026

## Aplicação

- Astro estático: build concluído, uma página HTML, sem servidor ou hidratação de framework. Checagem Astro/TypeScript com **0 erros, 0 avisos e 0 hints**.
- Playwright: **20 cenários aprovados** na execução completa, em desktop 1440 × 1000 e mobile 390 × 844. Incluem conteúdo, imagens, metadados, filtros, navegação, ampliação a 200%, players sob demanda, teclado e funcionamento sem JavaScript.
- Shows: todos os **48 registros brasileiros**, de 1997 a 2026, em ordem decrescente, agora em cards compactos (3 colunas no desktop, 2 no tablet e 1 no celular). Card inteiro clicável, com data, cidade, local e turnê; sem cabeçalho de tabela. Layout conferido em 1440, 900 e 390 px, sem transbordamento. Os 20 cenários passaram após incluir a linha do tempo, incluindo foco e carregamento de todos os cards. Rolagem própria com lotes de 12, preservação dos anteriores e da posição, botão alternativo, foco no primeiro novo link e lista completa sem JavaScript.
- Linha do tempo: 12 anos derivados dos 48 shows, de 2026 a 1997, com trilha preenchida, marcador móvel e ano destacado. Posição calculada pelos cards visíveis, sem usar o tamanho temporário da lista como fim do histórico. Conferidos rolagem nos dois sentidos, atualização após novos lotes, foco preservado, fim real em 1997 e retorno a 2026. Ajustada a tolerância para pixels fracionários no celular. Recalcula em resize e mudanças de layout; oculta sem JavaScript. Os quatro testes de timeline e navegação/ampliação passaram novamente após reservar espaço proporcional à fonte para os anos não sobreporem os cards a 200%.
- Veja: seis destaques e **20 links seguintes**, em outra área de rolagem, com lotes de cinco. Testados o carregamento até o último, ordem, links, foco manual, fallback sem IntersectionObserver e independência do histórico de shows. Corrigida a margem de observação para evitar carregar o segundo lote antes da rolagem no desktop; a suíte completa passou após a correção.
- Covers: sete projetos de tributo, após a inclusão da OctaDream em 21/09/2026, e **12 músicos** organizados em guitarra (6), baixo (3) e teclado (3). Samuel Zechin, Marcelo Barbosa e Alex Lima preservados.
- Fotos dos covers e músicos (21/09/2026): todos os **19 cards** têm foto de perfil local, colorida e circular. São 18 arquivos WebP; VRA! e Thiago Campos compartilham o mesmo perfil já identificado nos links. Dezessete cards usam fotos públicas do Instagram; Felipe Campos e César Zolhof usam avatares dos respectivos canais oficiais do YouTube, sem atribuir Instagram não confirmado. Fontes e resoluções originais em `docs/research/profile-images-*.json`. Miniaturas do Instagram vieram em 100 × 100 px; arquivos uniformizados em 240 × 240, exibidos a 80 px no desktop e 68 px no celular. Chrome: 19 fotos carregadas, nenhuma quebrada ou transbordamento horizontal. Build e checagem estática aprovados; oito cenários existentes de assets, navegação/ampliação a 200%, acessibilidade e conteúdo sem JavaScript passaram novamente em desktop e celular. Conferência visual em 1440 e 390 px.
- Rótulos Shows e Covers atualizados na navegação, hero, títulos e rodapé. Os IDs `relembre` e `va` continuam funcionando para preservar links antigos.
- Prévia local reiniciada após criar componentes: HTTP 200 em desktop e celular, sem transbordamento horizontal. Screenshots de vídeos, lista e músicos conferidos visualmente.
- axe-core: nenhuma violação WCAG A/AA detectada. Verificação automática, não certificação de acessibilidade.
- Nenhum iframe no HTML inicial. Apenas um vídeo por vez; abrir Spotify interrompe o vídeo. Fechar o diálogo remove o iframe e devolve o foco.

## Pesquisa e links

- Ranking: **26 vídeos selecionados entre 44 candidatos brasileiros elegíveis**, ordenados por visualizações totais. Contagens inteiras, autor, disponibilidade no Brasil e permissão de incorporação consultados nos metadados públicos do YouTube. Não é uma medição de views exclusivamente brasileiras nem um levantamento exaustivo de todo o YouTube.
- Excluídos uploads bloqueados no Brasil e falsos positivos de outros países, covers e reações. Solos e trechos identificados. Título/descrição dos seis destaques revisados separadamente: anos e cidades não confirmados foram omitidos; Finally Free é um trecho de 88 segundos.
- Evidências do ranking: `docs/research/youtube-ranking.json`, `youtube-brazil-candidates.json`, `youtube-rock-in-rio-candidates.json` e `youtube-top6-review.json`.
- Novos baixistas: Felipe Campos, Alexandre Panta e Felipe Andreoli. Novos tecladistas: Daniel Jorge, César Zolhof e Junior Carelli. Dois covers próprios de DT verificados por músico, totalizando 12 vídeos com canal correspondente e status OK. Instagram omitido quando não confirmado. Fontes: `docs/research/cover-musicians.json`.
- Relatório de links: **166 destinos responderam**, **16 perfis Instagram exigem login**, **0 links quebrados detectados**. O canonical permanece separado como `deployment-pending`; isso não indica disponibilidade do domínio final.
- Histórico brasileiro conferido contra o mapa de concertos do setlist.fm, contagens anuais e fontes por período em `docs/research/brazil-setlists*.json`. Cancelamentos e workshops excluídos; seis shows de 2026 têm setlists preenchidos.
- Agenda futura: bloco “O próximo encontro” temporariamente removido da página em 21/09/2026, a pedido do responsável pelo site. O histórico de 48 shows e a linha do tempo continuam presentes. Build e validação estática aprovados; os dois cenários existentes que conferem a ausência do painel passaram novamente em desktop e celular.
- Discografia: 28 lançamentos oficiais e capas locais; 27 referências Spotify provenientes das páginas oficiais, validadas por oEmbed. Live at Luna Park leva ao site oficial.
- Materiais: 14 referências, incluindo dois ebooks da Freenote e a busca com termo preservado. Evidências em `docs/research/freenote-ebooks.json`.
- Favicon: símbolo Majesty dourado/preto do site oficial, copiado sem alteração. PNGs locais de 32 × 32, 192 × 192 e 180 × 180 px; cabeçalho e três respostas HTTP 200 image/png conferidos no Chrome. Monograma SVG anterior removido. Fonte e tamanhos em `docs/research/favicon.json`.
- Autoria mantida: Eric Gomes, com link para `https://bio.ericgomes.me`. A fonte local do hero e suas condições estão em `src/assets/fonts/README.md`.

## Players externos

- Na prévia local atual, **These Walls (TqoCg7ezIxY) iniciou reprodução real**, sem mocks: o player avançou para 0:02 de 6:37. Registro em `docs/research/youtube-current-browser-verification.json`. Não foi assistido integralmente, nem testada a reprodução de todos os 26 vídeos.
- Os testes automatizados de interação substituem apenas o documento remoto do iframe para verificar a lógica local independentemente das plataformas. Metadados válidos não garantem reprodução em toda região, conta ou navegador. Links diretos permanecem disponíveis.
- Os relatórios `player-smoke.json`, `youtube-browser-verification.json` e `video-verification.json` documentam a **seleção anterior**: Afterlife e Night Terror ficaram indisponíveis no navegador automatizado, por causa inconclusiva. Esses IDs não fazem mais parte da seleção atual. O Spotify real retornou HTTP 200 e a lista de faixas de Quarantième naquele teste.

## Build e publicação

- **51 arquivos, 1.332.977 bytes**, incluindo 30 imagens WebP locais e a webfont do hero (14.148 bytes).
- JavaScript da aplicação: **6.108 bytes**. As listas não fazem chamadas de rede ao rolar; todos os registros estão no HTML.
- Build independente de rede; fontes e capas locais. Conferidos canonical, description, Open Graph, Twitter Cards, H1 único, alt text, favicon, sitemap, robots e CNAME.
- Workflow GitHub Actions preparado para `main`, Node 24, verificações de tipos/dados/build e publicação exclusiva de `dist/`.
- Remoto: `https://github.com/ericmgomes/site-dreamtheater.git`. GitHub Pages estava desativado na consulta anterior ao primeiro push. A execução real do workflow, ativação de Pages, DNS e HTTPS não foram validados nesta atualização; o push não comprova publicação no domínio final.
