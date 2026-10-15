# Deploy automático (Hostinger, sem queda)

Todo push na branch `main` publica o site em https://ourivesaria.arcanestudios.io.

## Como não cai

1. A versão nova sobe para uma pasta própria: `releases/<data>-<commit>/`.
2. Só depois de tudo enviado, o link `current` troca para ela numa operação atômica. O visitante nunca vê site pela metade.
3. O workflow testa o endereço. Se não responder, o link volta sozinho para a versão anterior e o deploy fica vermelho.
4. As últimas 5 versões ficam guardadas. Para voltar a uma delas: GitHub, aba Actions, "Deploy", Run workflow, preenchendo `rollback_to`.

## Configuração única (Hostinger)

Na pasta do site no servidor, a estrutura fica assim:

```
<REMOTE_BASE>/
  current   -> link para releases/<versão ativa>
  releases/
```

1. No hPanel, ative o acesso SSH e crie uma chave só para deploy (par de chaves; a pública vai em "SSH keys" da Hostinger).
2. Crie o subdomínio `ourivesaria.arcanestudios.io` e aponte a pasta raiz dele para `<REMOTE_BASE>/current`. Se o hPanel não aceitar link como pasta raiz, deixe a pasta raiz como `public_html/ourivesaria` e crie nela um link: `ln -s <REMOTE_BASE>/current public_html/ourivesaria` (apague a pasta vazia antes).
3. Se `current` já existir como pasta de verdade, o deploy para sem mexer em nada (de propósito). Mova o conteúdo para `releases/inicial` e crie o link: `ln -sfn releases/inicial current`.

## Secrets no GitHub (Settings, Secrets and variables, Actions)

| Nome | O que é |
|---|---|
| `HOSTINGER_SSH_HOST` | host ou IP do SSH |
| `HOSTINGER_SSH_PORT` | porta SSH (a Hostinger costuma usar 65002) |
| `HOSTINGER_SSH_USER` | usuário SSH |
| `HOSTINGER_REMOTE_BASE` | caminho absoluto da pasta que contém `current` e `releases` |
| `HOSTINGER_SSH_KEY` | chave privada de deploy (conteúdo completo) |
| `HOSTINGER_KNOWN_HOSTS` | saída de `ssh-keyscan -p <porta> <host>` (recomendado) |

Sem esses secrets o workflow só avisa e pula o deploy, sem falhar.

## Regras

- Nunca coloque chave, senha ou `.env` no repositório.
- O site precisa ter `index.html` na raiz (ou em `dist/`, `build/`, `out/`, `public/` se tiver `npm run build`).
- Arquivos `.js` e `.css` devem ser chamados com `?v=<versão>` e a versão muda a cada deploy, por causa do cache.
