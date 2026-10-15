#!/bin/bash
# Cola del episodio 13: render por tramos, master 1440p con la mezcla, short vertical y su codificación, y al final el
# detector de tramos congelados sobre ambos.
set -e
cd "$(dirname "$0")/.."
tools/render_ep13.sh
for n in $(seq -w 1 16); do [ -s video/out/ep13/c$n.mp4 ] || { echo "falta el tramo $n"; exit 1; }; done
echo "== master $(date +%H:%M)"
TRAMOS="video/out/ep13/c*.mp4" AUD=audio/mix/mezcla_ep13.wav OUT=video/out/el_lote_31202_1440p.mp4 \
  TITLE="EL LOTE 31.202 — Nueve barreras, noventa muertes" VBR=16M MAXRATE=24M BUFSIZE=36M tools/final_tramos.sh
echo "== short $(date +%H:%M)"
cd video && npx remotion render src/index13s.tsx ShortLote out/short13_muted.mp4 --muted --gl=swangle --crf=15 --concurrency=4 --log=error && rm -rf /tmp/remotion-webpack-bundle-* && cd ..
IN=video/out/short13_muted.mp4 AUD=audio/mix/mezcla_short13.wav OUT=entrega/el_lote_31202_short.mp4 TITLE="EL LOTE 31.202 (Short)" VBR=7M MAXRATE=12M BUFSIZE=20M tools/final.sh
echo "== control $(date +%H:%M)"
python3 tools/check_congelados.py video/out/el_lote_31202_1440p.mp4 || true
python3 tools/check_congelados.py entrega/el_lote_31202_short.mp4 || true
echo "COLA LISTA $(date +%H:%M)"
