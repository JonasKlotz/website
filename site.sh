#!/usr/bin/env bash
set -e

if [ ! -d node_modules ]; then
  echo "→ Installing dependencies..."
  npm install
fi

CMD=${1:-dev}

case "$CMD" in
  dev)
    echo "→ Dev server at http://localhost:4321 (hot reload)"
    npm run dev
    ;;
  build)
    echo "→ Building..."
    npm run build
    echo "✓ Built to dist/"
    ;;
  preview)
    echo "→ Building then previewing production output..."
    npm run build
    npm run preview
    ;;
  deploy)
    echo "→ Deploying to Cloudflare via git push..."
    git add -A
    read -rp "Commit message: " msg
    git commit -m "${msg:-update site}"
    git push
    echo "✓ Pushed — Cloudflare Pages will deploy in ~30s"
    ;;
  *)
    echo "Usage: ./site.sh [dev|build|preview|deploy]"
    exit 1
    ;;
esac
