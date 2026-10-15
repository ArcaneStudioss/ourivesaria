# Ourivesaria Medeiros

Landing page estática em português para a Ourivesaria Medeiros. Visual editorial em bordô, carvão, creme e dourado, botões arredondados, fotografias e logotipo da própria marca tratados a partir das imagens enviadas. Aliança 3D ilustrativa com rotação por mouse, toque ou teclado, troca de aparência e pausa.

[Site publicado](https://ourivesaria-medeiros-atelie.saltyluck65.chatgpt.site) · [Instagram da marca](https://www.instagram.com/ourivesaria_medeiros/)

## Executar

Sem build ou instalação. Requer Python 3 para a prévia:

```sh
python -m http.server 8080 --directory dist
```

Abra `http://localhost:8080`. Para simular a página 404 com seu status HTTP, execute `python qa-server.py` na pasta do projeto. A pasta publicável é `dist/` e funciona em hospedagens estáticas com URLs a partir da raiz do domínio.

## Publicar na Cloudflare

O repositório já tem um workflow e `wrangler.jsonc` configurados para publicar `public/` em `https://ourivesaria.arcanestudios.io`. A pasta `dist/` continua sendo a fonte da página.

Após editar `dist/`, rode:

```sh
npm ci
npm run build
```

O build não instala dependências de aplicação: copia `dist/` para `public/` e ajusta canonical, Open Graph, sitemap, robots e a origem de configuração para o domínio de produção. `SITE_URL` pode substituir esse domínio. A cópia `public/` é versionada para passar pela verificação inicial do workflow existente; ele também executa o build antes do deploy.

A configuração de deploy e rollback existente foi preservada. Os secrets da Cloudflare devem estar configurados no GitHub, conforme `DEPLOY.md`.

## Configurar os canais oficiais

Edite `dist/config.json`:

| Campo | Uso |
| --- | --- |
| `whatsappNumber` | Número no formato 55 + DDD + número, somente dígitos. Enquanto vazio, o fluxo prepara a mensagem e direciona ao Instagram com instruções claras para copiar e enviar. |
| `instagram` | Perfil confirmado pelas imagens enviadas: `ourivesaria_medeiros`. |
| `address` | Endereço comercial confirmado. Exibe a localização e o link de rotas quando preenchido. |
| `mapsUrl` | Link de rotas, opcional; sem ele, o Maps busca pelo endereço configurado. |
| `responsePromise` | Prazo real de resposta, caso exista. Sem promessa não se exibe um prazo inventado. |
| `gaMeasurementId` | ID real G-XXXXXXXX. Analytics só carrega após configuração e consentimento. Eventos não enviam nome nem texto da ideia. |
| `origin` | Domínio do site. Ao mudar, atualize também canonical, OG, sitemap e JSON-LD nos HTML. |

Número de WhatsApp, endereço exato, prazo de resposta e ID de Analytics ainda não foram fornecidos. Nenhum dado de exemplo foi publicado nesses campos.

## Imagens e produtos

Fotos e logotipo fornecidos pelo usuário a partir do Instagram da própria marca. Tratamento com IA para retirar a interface dos prints e melhorar definição, luz e enquadramento. As imagens publicadas correspondem às criações apresentadas nos registros fornecidos:

- Alianças de moeda antiga com forro de prata, 4 mm, abauladas.
- Pingente Santa Luzia em prata 950.
- Alianças em prata 950 de 4 mm, chanfradas e diamantadas, com solitário Dois Fios.
- Anéis de formatura em prata 950, com pedra verde ou vermelha, em modelos distintos.
- Alianças Dois Fios e apresentação de alianças lisas no ateliê.

O 3D é ilustrativo; medidas, composição, preços, disponibilidade e prazos devem ser confirmados no atendimento. Os arquivos originais recebidos permanecem fora deste repositório. As fotos dos produtos são materiais da marca e não fazem parte das licenças de código das dependências.

## Recursos

Galeria filtrável, detalhes de produtos e fotos alternativas, formulário com rascunho local, página de agradecimento com cópia de mensagem, CTA fixo móvel, FAQ com cinco perguntas, privacidade, 404, breadcrumbs, SEO, Open Graph, sitemap, robots, FAQPage e JewelryStore sem informações comerciais inventadas. Redução de animações respeitada. Fontes, imagens e Three.js servidos localmente.

O formulário não simula envio: a mensagem só chega ao ateliê quando o visitante a envia no canal oficial. O rascunho pode ser apagado nas páginas de agradecimento e privacidade.

## Verificação

Navegação e fluxos verificados em Chromium: computador e celular, filtros, seleção de fotos, diálogo de produtos, preparação e exclusão de mensagem, WhatsApp configurado em teste isolado, consentimento do Analytics, controle do 3D, FAQ e erro 404. Não há backend de pedidos ou pagamentos.

## Dependências

Three.js 0.169.0 (MIT), Cormorant Garamond e Manrope (SIL Open Font License), símbolos DejaVu. Licenças em `dist/assets/licenses/`.

## Referências públicas

- [Matéria de O Liberal sobre o processo de alianças de moeda da marca](https://www.oliberal.com/variedades/amp/aliancas-feitas-com-moedas-antigas-se-tornam-tendencia-entre-casais-saiba-como-sao-feitas-1.946698)
- [Canal da Ourivesaria Medeiros](https://www.youtube.com/channel/UCdeiM1UA20WyvphwqLTImnA)
