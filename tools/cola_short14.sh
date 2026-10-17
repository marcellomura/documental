#!/bin/bash
# Short del episodio 14: espera a que termine la cola del episodio (para no competir por CPU), renderiza el short vertical,
# lo codifica con su mezcla y pasa el detector de tramos congelados. Se puede relanzar.
set -e
cd "$(dirname "$0")/.."
while pgrep -f cola_ep14.sh >/dev/null; do sleep 30; done
PUB=${PUB:-/tmp/claude-0/pub14s}
rm -rf "${PUB:?}" && mkdir -p "$PUB/ep05" && cp -rl video/public/fonts video/public/brand video/public/tex video/public/ep14 "$PUB/" && cp -rl video/public/ep05/globe "$PUB/ep05/"
S=video/out/short14_muted.mp4
if [ ! -s $S ]; then
  echo "== short $(date +%H:%M)"
  (cd video && npx remotion render src/index14s.tsx ShortCielo out/short14_muted.tmp.mp4 --public-dir="$PUB" --muted --gl=swangle --crf=15 --concurrency=4 --timeout=240000 --log=error && mv out/short14_muted.tmp.mp4 out/short14_muted.mp4)
  rm -rf /tmp/remotion-webpack-bundle-*
fi
IN=$S AUD=audio/mix/mezcla_short14.wav OUT=entrega/campo_del_cielo_short.mp4 TITLE="CAMPO DEL CIELO (Short)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
echo "== control $(date +%H:%M)"
python3 tools/check_congelados.py entrega/campo_del_cielo_short.mp4 || true
echo "SHORT LISTO $(date +%H:%M)"
