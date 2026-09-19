# Validação — 19/09/2026

## Aplicação

- Astro: build estático concluído; uma página HTML, sem saída de servidor.
- TypeScript/Astro: **0 erros, 0 avisos, 0 hints**.
- Playwright: **12 testes aprovados**, em desktop 1440 × 1000 e mobile 390 × 844.
- Restrição do Relembre ao Brasil: suíte completa de 12 testes executada novamente e aprovada, incluindo sete shows brasileiros visíveis com e sem JavaScript e ausência do filtro de país. Validação dos dados impede a inclusão de outros países.
- Atualização dos covers: quatro verificações de renderização e acessibilidade executadas novamente e aprovadas em desktop/mobile; os cinco links indicados pelo usuário estão presentes no HTML final.
- Atualização da Freenote: dois ebooks de guitarra e busca completa incluídos; tipos, dados e build aprovados. As quatro verificações de renderização e acessibilidade passaram novamente em desktop/mobile. Os dois links de produto e a busca com termo preservado foram conferidos no HTML final.
- Guitarristas: seis na seleção, incluindo Samuel Zechin, Marcelo Barbosa e Alex Lima; tipos, dados e build aprovados, com quatro verificações de renderização e acessibilidade novamente aprovadas em desktop/mobile. Instagram de Samuel e canais de Marcelo confirmados pelos sites pessoais e metadados públicos. YouTube antigo de Samuel retorna 404 e foi omitido. Alex foi indicado pelo usuário; nome confirmado nos metadados de @alekissss10, sem inferir músicas específicas ou outros canais.
- axe-core: nenhuma violação WCAG A/AA detectada nas páginas testadas. Isso é uma verificação automática, não uma certificação de acessibilidade.
- Conferidos: seleção exclusiva de shows no Brasil, filtros de discografia, datas decrescentes, âncoras, header fixo, WhatsApp, ampliação de texto a 200%, navegação por teclado, fechamento do player e retorno do foco.
- Sem JavaScript: conteúdo completo, âncoras e destinos externos continuam presentes; filtros ficam ocultos.
- Nenhum iframe no HTML inicial. Um vídeo por vez e apenas um player Spotify; abrir Spotify interrompe o vídeo anterior. Fechar o diálogo remove o iframe.
- Player YouTube: metadados oficiais e permissão de incorporação conferidos para os seis IDs. Testes de interação separam a lógica local do comportamento do serviço externo.
- Spotify: 27 referências derivadas das respectivas páginas oficiais, todas validadas por oEmbed; nenhuma referência inventada para Live at Luna Park.

## Dados e links

- 7 setlists individuais, todos brasileiros, sem eventos futuros misturados ao histórico. O filtro de país foi removido; a seleção permanece exclusivamente brasileira mesmo sem JavaScript.
- Os seis registros brasileiros de 2026 possuem músicas registradas; não são eventos vazios.
- Agenda futura: nenhuma data posterior à pesquisa confirmada nas fontes consultadas; a página oferece a agenda oficial e informa a data da consulta.
- Discografia: 28 páginas oficiais percorridas; 28 capas verificadas e otimizadas; categoria e ordem do índice preservadas.
- Doze perfis Instagram exigiram login para navegação completa. URLs respaldadas por fontes e indicações do usuário; nomes dos quatro novos covers, Samuel Zechin, Marcelo Barbosa e Alex Lima confirmados nos metadados públicos. A navegação completa continua identificada como `login-gated`.
- Relatório da versão final: **95 URLs responderam**, **12 exigem login**, **0 links quebrados detectados**; o canonical fica separado como `deployment-pending`.
- Autoria: rodapé credita Eric Gomes com link para `https://bio.ericgomes.me`, confirmado por HTTP 200. Texto de autoria coletiva removido da página e README; build e HTML final conferidos.
- Materiais: 14 referências. A busca da Freenote retornou 19 produtos, sendo dois explicitamente marcados como livro digital. Ambos foram conferidos nas páginas individuais: leitura online por código no Hal Leonard MyLibrary. Evidências em `docs/research/freenote-ebooks.json`.
- Seis tributos brasileiros na seleção, incluindo Dream Theater Cover, Dream Theater Classics, Dream Theater Cover BH, Banda Dream Machine e o site do VRA! solicitados pelo usuário. Não foram inferidas datas de atividade recente para os novos perfis.
- Procedência, particularidades dos anos oficiais e evidências de atividade estão em `docs/research/`.

## Build e publicação

- Build: 47 arquivos, cerca de 1,24 MB no total, incluindo 30 imagens WebP locais.
- JavaScript da aplicação: **2.945 bytes**, incorporado pelo Astro; nenhum framework de hidratação.
- Fontes locais. Conteúdo e capas independem de acesso externo no build.
- Conferidos: canonical, description, Open Graph, Twitter Cards, H1 único, alt text, favicon, sitemap, robots e CNAME.
- YAML do GitHub Actions validado: dispara em `main`, usa Node 24, verifica tipos/dados/build, publica somente `dist/`, com permissões de Pages/OIDC no job de deploy.
- `npm install`/auditoria: zero vulnerabilidades reportadas na instalação final.

**Limite da validação remota:** o remoto `origin` aponta para `https://github.com/ericmgomes/site-dreamtheater.git`. Na consulta anterior ao primeiro push, GitHub Pages estava desativado. A execução real do workflow, a ativação de Pages e a configuração de DNS e HTTPS ainda não foram validadas. Siga as instruções do README para concluir a publicação.

**Limite dos players externos:** o relatório `docs/research/player-smoke.json` registra o teste real no navegador, separado dos testes locais determinísticos. Reprodução completa, disponibilidade regional e exigências de conta dependem das plataformas. Os links diretos permanecem acessíveis na interface.

No teste real, o Spotify retornou HTTP 200 e o álbum Quarantième com sua lista de faixas. O YouTube exibiu “This video is unavailable” para Afterlife e Night Terror, tanto no host padrão quanto em youtube-nocookie.com, embora os metadados confirmassem os vídeos e permissão de incorporação. A causa permanece inconclusiva; a reprodução real do YouTube **não foi aprovada** neste ambiente. URLs, criação sob demanda do iframe e alternativas de acesso direto foram verificadas. Consulte `docs/research/youtube-browser-verification.json` e confira novamente o player no domínio publicado.
