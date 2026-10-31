#!/usr/bin/env bash
# Скрипт запуска Siteau Backend
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

if [ -f "dist/index.js" ]; then
  node dist/index.js
else
  npx tsx src/index.ts
fi
