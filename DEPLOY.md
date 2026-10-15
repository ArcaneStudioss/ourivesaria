# Deploy automático (Cloudflare Workers, sem queda)

Todo push na `main` publica o conteúdo de `public/` em https://ourivesaria.arcanestudios.io.

## Como não cai

- Cada deploy cria uma versão nova na Cloudflare e só passa a servir quando está completa. Não existe site pela metade.
- Depois de publicar, o workflow testa o endereço. Se não responder, ele volta sozinho para a versão anterior (`wrangler rollback`).
- Voltar à mão: GitHub, aba Actions, "Deploy", Run workflow, marcando `rollback`.

## Como usar

1. Coloque os arquivos do site em `public/` (com `index.html` na raiz da pasta).
2. Faça o push na `main`. Sem `public/index.html` o deploy é pulado com um aviso, sem erro.
3. Se o projeto tiver `npm run build`, ele roda antes, e o build deve gerar a pasta `public/`.

## Configuração única

1. **Token da Cloudflare:** no painel, Meu perfil, Tokens de API, modelo "Edit Cloudflare Workers". Guarde só no GitHub, nunca no repo nem no chat.
2. **Secrets no GitHub** (Settings, Secrets and variables, Actions): `CLOUDFLARE_API_TOKEN` e `CLOUDFLARE_ACCOUNT_ID`. Sem eles o workflow só avisa e pula.
3. **Endereço `ourivesaria.arcanestudios.io`:** o domínio `arcanestudios.io` precisa estar como zona na Cloudflare (nameservers apontando para ela). O `wrangler.jsonc` já cria o endereço e o certificado no primeiro deploy. Antes de trocar os nameservers, copie todos os registros atuais da zona (principalmente o do `crm`, que aponta para a VPS), senão o CRM sai do ar.
   - Se preferir testar antes: apague o bloco `routes` do `wrangler.jsonc`; o site sobe em `ourivesaria.<sua-conta>.workers.dev`.

## Regras

- Nunca coloque token, chave ou `.env` no repositório.
- Sem tracinho longo (—) em texto de site.
