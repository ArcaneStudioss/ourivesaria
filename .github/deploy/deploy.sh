#!/usr/bin/env bash
# Deploy sem queda: sobe a versão nova numa pasta própria (releases/<id>) e só
# troca o link "current" no final, de forma atômica. Se o site não responder
# depois da troca, volta sozinho para a versão anterior.
#
# Variáveis esperadas (vêm dos secrets do GitHub, nada fica gravado aqui):
#   SSH_HOST SSH_PORT SSH_USER REMOTE_BASE SITE_URL SRC_DIR
# Opcionais:
#   KEEP_RELEASES (padrão 5)   ROLLBACK_TO (nome de uma release para voltar)
set -euo pipefail

: "${SSH_HOST:?}" "${SSH_USER:?}" "${REMOTE_BASE:?}" "${SITE_URL:?}"
SSH_PORT="${SSH_PORT:-22}"
KEEP_RELEASES="${KEEP_RELEASES:-5}"
SRC_DIR="${SRC_DIR:-.}"
ROLLBACK_TO="${ROLLBACK_TO:-}"

SSH_OPTS=(-p "$SSH_PORT" -i "$HOME/.ssh/deploy_key" -o BatchMode=yes -o StrictHostKeyChecking=yes)
remote() { ssh "${SSH_OPTS[@]}" "$SSH_USER@$SSH_HOST" "$@"; }

check_site() {
  curl -fsSL --max-time 20 --retry 5 --retry-delay 4 --retry-all-errors \
    -o /dev/null -H 'Cache-Control: no-cache' "$SITE_URL/?deploycheck=$(date +%s)"
}

swap_to() { # $1 = nome da release
  remote "set -e; cd '$REMOTE_BASE'; ln -sfn 'releases/$1' current.new; mv -Tf current.new current"
}

# O "current" precisa ser um link. Se já for uma pasta de verdade, parar sem mexer em nada.
remote "mkdir -p '$REMOTE_BASE/releases'; if [ -e '$REMOTE_BASE/current' ] && [ ! -L '$REMOTE_BASE/current' ]; then echo 'ERRO: current existe e não é um link simbólico. Veja o DEPLOY.md.' >&2; exit 3; fi"

PREV="$(remote "readlink '$REMOTE_BASE/current' 2>/dev/null | xargs -r basename" || true)"

if [ -n "$ROLLBACK_TO" ]; then
  remote "test -d '$REMOTE_BASE/releases/$ROLLBACK_TO'" || { echo "Release $ROLLBACK_TO não existe." >&2; exit 4; }
  swap_to "$ROLLBACK_TO"
  check_site
  echo "Voltou para $ROLLBACK_TO."
  exit 0
fi

REL="$(date -u +%Y%m%d%H%M%S)-${GITHUB_SHA:0:7}"
DEST="$REMOTE_BASE/releases/$REL"

[ -f "$SRC_DIR/index.html" ] || { echo "ERRO: $SRC_DIR/index.html não existe, abortando antes de subir." >&2; exit 5; }

LINK_DEST=()
[ -n "$PREV" ] && LINK_DEST=(--link-dest="$REMOTE_BASE/releases/$PREV")

rsync -az --delete "${LINK_DEST[@]}" \
  --exclude='.git' --exclude='.github' --exclude='.gitignore' --exclude='node_modules' \
  --exclude='README.md' --exclude='DEPLOY.md' --exclude='.env' --exclude='.env.*' \
  -e "ssh ${SSH_OPTS[*]}" "$SRC_DIR/" "$SSH_USER@$SSH_HOST:$DEST/"

remote "test -f '$DEST/index.html'"
swap_to "$REL"

if ! check_site; then
  echo "Site não respondeu depois da troca." >&2
  if [ -n "$PREV" ]; then
    swap_to "$PREV"
    echo "Voltei para a versão anterior ($PREV)." >&2
  fi
  exit 1
fi

# Mantém só as últimas N versões (a atual e a anterior sempre estão entre elas).
remote "cd '$REMOTE_BASE/releases' && ls -1dt */ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf"
echo "Deploy ok: $REL"
